import { Request, Response } from 'express';
import Joi from 'joi';
import { authService } from '../services/authService';
import { googleAuthService } from '../services/googleAuth';

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          success: false, 
          message: error.details[0].message 
        });
        return;
      }

      const result = await authService.register(value);
      
      res.status(201).json({
        success: true,
        message: result.message,
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          isEmailVerified: result.user.isEmailVerified,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({ 
          success: false, 
          message: error.details[0].message 
        });
        return;
      }

      const userAgent = req.get('User-Agent');
      const ipAddress = req.ip;

      const result = await authService.login(
        value.email,
        value.password,
        userAgent,
        ipAddress
      );

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          avatar: result.user.avatar,
          role: result.user.role,
          preferences: result.user.preferences,
          progress: result.user.progress,
        },
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { code } = req.body;
      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Authorization code is required',
        });
        return;
      }

      const result = await googleAuthService.authenticateWithGoogle(code);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Google login successful',
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          avatar: result.user.avatar,
          role: result.user.role,
          preferences: result.user.preferences,
          progress: result.user.progress,
        },
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Google login failed',
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({
          success: false,
          message: 'Refresh token not provided',
        });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      // Set new refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        user: {
          id: result.user._id,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          email: result.user.email,
          avatar: result.user.avatar,
          role: result.user.role,
          preferences: result.user.preferences,
          progress: result.user.progress,
        },
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        await authService.logout(token);
      }

      res.clearCookie('refreshToken');
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Logout failed',
      });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Verification token is required',
        });
        return;
      }

      await authService.verifyEmail(token);
      res.json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Email verification failed',
      });
    }
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await authService.resendVerificationEmail(email);
      res.json({
        success: true,
        message: 'Verification email sent successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend verification email',
      });
    }
  }

  async skipVerification(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
        });
        return;
      }

      await authService.skipEmailVerification(email);
      res.json({
        success: true,
        message: 'Email verification skipped for development',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to skip verification',
      });
    }
  }
}

export const authController = new AuthController();
