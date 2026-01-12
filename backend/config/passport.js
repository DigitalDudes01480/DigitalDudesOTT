import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import User from '../models/User.js';

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.BACKEND_URL) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    proxy: true,
    passReqToCallback: false
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Validate profile data
      if (!profile || !profile.id || !profile.emails || !profile.emails[0]) {
        return done(new Error('Invalid profile data from Google'), null);
            role: 'customer'
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

// Facebook OAuth Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET && process.env.BACKEND_URL) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos']
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ 
            $or: [
              { providerId: profile.id, authProvider: 'facebook' },
              { email: profile.emails && profile.emails[0] ? profile.emails[0].value : null }
            ]
          });

          if (user) {
            // Update existing user if they signed up with email/password
            if (user.authProvider === 'local') {
              user.authProvider = 'facebook';
              user.providerId = profile.id;
              user.isEmailVerified = true;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.id}@facebook.com`,
            authProvider: 'facebook',
            providerId: profile.id,
            isEmailVerified: true,
            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
            role: 'customer'
          });

          done(null, user);
        } catch (error) {
          done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
