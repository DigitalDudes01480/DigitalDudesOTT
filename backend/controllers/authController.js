import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import passport from '../config/passport.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer'
    });

    const token = generateToken(user._id);

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Digital Dudes!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with Digital Dudes. Your account has been created successfully.</p>
        <p>You can now browse and purchase OTT subscriptions at amazing prices!</p>
        <p>Best regards,<br>Digital Dudes Team</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Welcome to Digital Dudes!',
      html: welcomeHtml
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      });
    }

    if (user.authProvider && user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'Please sign in using Google/Facebook for this account'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail(user, resetUrl);

    if (!emailResult.success) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'Password change is not available for this account'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Google OAuth
export const googleAuth = (req, res, next) => {
  if (!passport?._strategy?.('google')) {
    return res.status(503).json({
      success: false,
      message: 'Google login is not configured on the server'
    });
  }

  const getPrimaryFrontendBase = () => 'https://www.digitaldudesott.shop';

  const getAllowedWebOrigins = () => {
    const origins = new Set([
      'http://localhost:5173',
      'http://localhost:3000',
      'https://digitaldudesott.shop',
      'https://www.digitaldudesott.shop'
    ]);
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          origins.add(u.origin);
        }
      } catch (_) {
      }
    }
    return origins;
  };

  const sanitizeRedirect = (candidate) => {
    if (!candidate) return null;
    const value = String(candidate).trim();
    const allowPrefixes = ['digitaldudes://', 'digitaldudesapp://', 'intent://'];
    if (allowPrefixes.some((p) => value.startsWith(p))) return value;
    try {
      const u = new URL(value);
      const allowedWebOrigins = getAllowedWebOrigins();
      if (allowedWebOrigins.has(u.origin)) return value;
    } catch (_) {
    }
    return null;
  };

  const inferWebRedirectFromReferer = () => {
    try {
      const ref = req.get('referer') || req.get('referrer');
      if (!ref) return null;
      const u = new URL(ref);
      const candidate = `${u.origin}/auth/callback`;
      return sanitizeRedirect(candidate);
    } catch (_) {
      return null;
    }
  };

  const redirect = sanitizeRedirect(req.query.redirect) || inferWebRedirectFromReferer() || getPrimaryFrontendBase() + '/auth/callback';
  const state = redirect ? Buffer.from(JSON.stringify({ redirect })).toString('base64url') : undefined;

  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    ...(state ? { state } : {})
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  if (!passport?._strategy?.('google')) {
    const fallbackBase = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace(/\/+$/, '')
      : 'https://www.digitaldudesott.shop';
    return res.redirect(`${fallbackBase}/login?error=google_not_configured`);
  }

  const getPrimaryFrontendBase = () => 'https://www.digitaldudesott.shop';

  const getAllowedWebOrigins = () => {
    const origins = new Set([
      'http://localhost:5173',
      'http://localhost:3000',
      'https://digitaldudesott.shop',
      'https://www.digitaldudesott.shop'
    ]);
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          origins.add(u.origin);
        }
      } catch (_) {
      }
    }
    return origins;
  };

  const getDefaultFrontendBase = () => {
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          return process.env.FRONTEND_URL.replace(/\/+$/, '');
        }
      } catch (_) {
      }
    }
    return getPrimaryFrontendBase();
  };

  const sanitizeRedirect = (candidate) => {
    if (!candidate) return null;
    const value = String(candidate).trim();
    const allowPrefixes = ['digitaldudes://', 'digitaldudesapp://', 'intent://'];
    if (allowPrefixes.some((p) => value.startsWith(p))) return value;
    try {
      const u = new URL(value);
      const allowedWebOrigins = getAllowedWebOrigins();
      if (allowedWebOrigins.has(u.origin)) return value;
    } catch (_) {
    }
    return null;
  };

  const parseStateRedirect = () => {
    try {
      if (!req.query.state) return null;
      const parsed = JSON.parse(Buffer.from(String(req.query.state), 'base64url').toString('utf8'));
      return sanitizeRedirect(parsed?.redirect);
    } catch (_) {
      return null;
    }
  };

  const appendParams = (base, params) => {
    const q = new URLSearchParams(params);
    return base.includes('?') ? `${base}&${q.toString()}` : `${base}?${q.toString()}`;
  };

  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${getDefaultFrontendBase()}/login?error=authentication_failed`);
    }

    const token = generateToken(user._id);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    };

    // Redirect to frontend with token
    const userParam = encodeURIComponent(Buffer.from(JSON.stringify(safeUser)).toString('base64'));
    const stateRedirect = parseStateRedirect();
    const fallback = `${getDefaultFrontendBase()}/auth/callback?token=${token}&provider=google&user=${userParam}`;
    if (!stateRedirect) {
      return res.redirect(fallback);
    }
    return res.redirect(
      appendParams(stateRedirect, {
        token,
        provider: 'google',
        user: userParam
      })
    );
  })(req, res, next);
};

// Facebook OAuth
export const facebookAuth = (req, res, next) => {
  if (!passport?._strategy?.('facebook')) {
    return res.status(503).json({
      success: false,
      message: 'Facebook login is not configured on the server'
    });
  }

  const getPrimaryFrontendBase = () => 'https://www.digitaldudesott.shop';

  const getAllowedWebOrigins = () => {
    const origins = new Set([
      'http://localhost:5173',
      'http://localhost:3000',
      'https://digitaldudesott.shop',
      'https://www.digitaldudesott.shop'
    ]);
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          origins.add(u.origin);
        }
      } catch (_) {
      }
    }
    return origins;
  };

  const sanitizeRedirect = (candidate) => {
    if (!candidate) return null;
    const value = String(candidate).trim();
    const allowPrefixes = ['digitaldudes://', 'digitaldudesapp://', 'intent://'];
    if (allowPrefixes.some((p) => value.startsWith(p))) return value;
    try {
      const u = new URL(value);
      const allowedWebOrigins = getAllowedWebOrigins();
      if (allowedWebOrigins.has(u.origin)) return value;
    } catch (_) {
    }
    return null;
  };

  const inferWebRedirectFromReferer = () => {
    try {
      const ref = req.get('referer') || req.get('referrer');
      if (!ref) return null;
      const u = new URL(ref);
      const candidate = `${u.origin}/auth/callback`;
      return sanitizeRedirect(candidate);
    } catch (_) {
      return null;
    }
  };

  const redirect = sanitizeRedirect(req.query.redirect) || inferWebRedirectFromReferer() || getPrimaryFrontendBase() + '/auth/callback';
  const state = redirect ? Buffer.from(JSON.stringify({ redirect })).toString('base64url') : undefined;

  return passport.authenticate('facebook', {
    scope: ['email'],
    ...(state ? { state } : {})
  })(req, res, next);
};

export const facebookCallback = (req, res, next) => {
  if (!passport?._strategy?.('facebook')) {
    const fallbackBase = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.replace(/\/+$/, '')
      : 'https://www.digitaldudesott.shop';
    return res.redirect(`${fallbackBase}/login?error=facebook_not_configured`);
  }

  const getPrimaryFrontendBase = () => 'https://www.digitaldudesott.shop';

  const getAllowedWebOrigins = () => {
    const origins = new Set([
      'http://localhost:5173',
      'http://localhost:3000',
      'https://digitaldudesott.shop',
      'https://www.digitaldudesott.shop'
    ]);
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          origins.add(u.origin);
        }
      } catch (_) {
      }
    }
    return origins;
  };

  const getDefaultFrontendBase = () => {
    if (process.env.FRONTEND_URL) {
      try {
        const u = new URL(process.env.FRONTEND_URL);
        if (u.hostname === 'digitaldudesott.shop' || u.hostname === 'www.digitaldudesott.shop') {
          return process.env.FRONTEND_URL.replace(/\/+$/, '');
        }
      } catch (_) {
      }
    }
    return getPrimaryFrontendBase();
  };

  const sanitizeRedirect = (candidate) => {
    if (!candidate) return null;
    const value = String(candidate).trim();
    const allowPrefixes = ['digitaldudes://', 'digitaldudesapp://', 'intent://'];
    if (allowPrefixes.some((p) => value.startsWith(p))) return value;
    try {
      const u = new URL(value);
      const allowedWebOrigins = getAllowedWebOrigins();
      if (allowedWebOrigins.has(u.origin)) return value;
    } catch (_) {
    }
    return null;
  };

  const parseStateRedirect = () => {
    try {
      if (!req.query.state) return null;
      const parsed = JSON.parse(Buffer.from(String(req.query.state), 'base64url').toString('utf8'));
      return sanitizeRedirect(parsed?.redirect);
    } catch (_) {
      return null;
    }
  };

  const appendParams = (base, params) => {
    const q = new URLSearchParams(params);
    return base.includes('?') ? `${base}&${q.toString()}` : `${base}?${q.toString()}`;
  };

  passport.authenticate('facebook', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${getDefaultFrontendBase()}/login?error=authentication_failed`);
    }

    const token = generateToken(user._id);

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    };

    // Redirect to frontend with token
    const userParam = encodeURIComponent(Buffer.from(JSON.stringify(safeUser)).toString('base64'));
    const stateRedirect = parseStateRedirect();
    const fallback = `${getDefaultFrontendBase()}/auth/callback?token=${token}&provider=facebook&user=${userParam}`;
    if (!stateRedirect) {
      return res.redirect(fallback);
    }
    return res.redirect(
      appendParams(stateRedirect, {
        token,
        provider: 'facebook',
        user: userParam
      })
    );
  })(req, res, next);
};
