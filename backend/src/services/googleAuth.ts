import { google } from 'googleapis';
import { User } from '../models/User';
import { authService } from './authService';

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

class GoogleAuthService {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async authenticateWithGoogle(code: string): Promise<{ user: any; accessToken: string; refreshToken: string }> {
    try {
      // Exchange code for tokens
      const { tokens: googleTokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(googleTokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const googleUser = data as GoogleUserInfo;

      // Check if user exists
      let user = await User.findOne({ email: googleUser.email });

      if (!user) {
        // Create new user
        user = new User({
          firstName: googleUser.given_name || googleUser.name.split(' ')[0],
          lastName: googleUser.family_name || googleUser.name.split(' ').slice(1).join(' '),
          email: googleUser.email,
          googleId: googleUser.id,
          avatar: googleUser.picture,
          isEmailVerified: googleUser.verified_email,
        });
        await user.save();
      } else if (!user.googleId) {
        // Link existing account with Google
        user.googleId = googleUser.id;
        user.avatar = googleUser.picture;
        if (googleUser.verified_email) {
          user.isEmailVerified = true;
        }
        await user.save();
      }

      // Generate JWT tokens using internal method
      const jwtTokens = (authService as any).generateTokens(user._id);
      
      // Update last login for Google OAuth user
      user.lastLogin = new Date();
      await user.save();

      return { 
        user, 
        accessToken: jwtTokens.accessToken, 
        refreshToken: jwtTokens.refreshToken 
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new Error('Google authentication failed');
    }
  }
}

export const googleAuthService = new GoogleAuthService();
