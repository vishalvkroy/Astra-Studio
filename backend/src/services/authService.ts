import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User';
import { emailService } from './emailService';
import { generateDefaultAvatar } from '../utils/avatarGenerator';

export interface LoginResult {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class AuthService {
  private generateTokens(userId: string) {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '15m' } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' } as jwt.SignOptions
    );

    return { accessToken, refreshToken };
  }

  async register(userData: RegisterData): Promise<{ user: IUser; message: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Generate default avatar
    const avatar = generateDefaultAvatar(userData.firstName, userData.lastName, userData.email);

    // Create new user with avatar
    const user = new User({
      ...userData,
      avatar,
    });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

    return {
      user,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  }

  async login(email: string, password: string, userAgent?: string, ipAddress?: string): Promise<LoginResult> {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if user has a password (not OAuth-only account)
    if (!user.password) {
      throw new Error('This account uses Google Sign-In. Please login with Google.');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Skip email verification in development mode
    if (process.env.NODE_ENV !== 'development' && !user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(user._id);

    // Store session info in user document (MongoDB only)
    user.lastLogin = new Date();
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string): Promise<LoginResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user._id);

      return { user, accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(token: string): Promise<void> {
    // For now, just return success since we removed MySQL sessions
    return;
  }

  async verifyEmail(token: string): Promise<void> {
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);
  }

  async skipEmailVerification(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  }
}

export const authService = new AuthService();
