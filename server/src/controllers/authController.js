import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { generateAndSendOTP, verifyOTP } from '../services/otpService.js';
import { env } from '../config/env.js';
import { anonymizeUser } from '../utils/userUtils.js';

const AVATAR_PRESETS = [
  'avatar-cyberpunk',
  'avatar-ninja',
  'avatar-astronaut',
  'avatar-fox',
  'avatar-robot',
  'avatar-wizard',
  'avatar-pixel',
  'avatar-samurai',
  'avatar-alien',
  'avatar-hacker',
  'avatar-warrior',
  'avatar-cosmonaut'
];

export function getRandomAvatar() {
  const index = Math.floor(Math.random() * AVATAR_PRESETS.length);
  return AVATAR_PRESETS[index];
}

export function generateTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.ACCESS_TOKEN_TTL || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion || 0 },
    env.JWT_REFRESH_SECRET,
    { expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS || 7}d` }
  );

  return { accessToken, refreshToken };
}

export function setAuthCookies(res, accessToken, refreshToken) {
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  });

  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: (env.REFRESH_TOKEN_TTL_DAYS || 7) * 24 * 60 * 60 * 1000
    });
  }
}

// 1. Direct Registration (sets emailVerified false by default if not verified via OTP)
export async function register(req, res) {
  try {
    const { name, username, email, phone, password, avatar } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    // Check existing
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }, { phone: cleanPhone }]
    });

    if (existing) {
      let field = 'Email';
      if (existing.username === cleanUsername) field = 'Username';
      if (existing.phone === cleanPhone) field = 'Phone Number';
      return res.status(409).json({ success: false, message: `${field} is already registered.` });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (emailVerified is false for direct registration unless development)
    const isDev = env.NODE_ENV === 'development';
    const allocatedAvatar = avatar || getRandomAvatar();
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      avatar: allocatedAvatar,
      emailVerified: isDev,
      status: 'active'
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to E-Shop.',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        addresses: user.addresses || [],
        defaultPincode: user.defaultPincode
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 2. Register: Request OTP
export async function registerRequest(req, res) {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim();

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
    }

    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }, { phone: cleanPhone }]
    });

    if (existing) {
      let field = 'Email';
      if (existing.username === cleanUsername) field = 'Username';
      if (existing.phone === cleanPhone) field = 'Phone Number';
      return res.status(409).json({ success: false, message: `${field} is already registered.` });
    }

    await generateAndSendOTP(cleanEmail, 'register');

    return res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Enter code to complete registration.`,
      target: cleanEmail
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Register: Verify OTP & Complete Registration
export async function registerVerify(req, res) {
  try {
    const { name, username, email, phone, password, otp } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = username ? String(username).trim().toLowerCase() : cleanEmail.split('@')[0];
    const cleanPhone = phone ? String(phone).trim() : '0000000000';

    // Verify OTP first
    const verification = await verifyOTP(cleanEmail, otp, 'register');
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Re-verify uniqueness at time of registration completion to prevent parallel race conditions (P1-7)
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }, { phone: cleanPhone }]
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email, username, or phone already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const allocatedAvatar = getRandomAvatar();
    const user = await User.create({
      name: (name || 'E-Shop Customer').trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      avatar: allocatedAvatar,
      emailVerified: true,
      phoneVerified: true,
      status: 'active'
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Registration and verification successful! Welcome to E-Shop.',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Multi-Identifier Login (Username, Email, or Phone)
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and password.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();

    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { username: cleanId },
        { phone: String(identifier).trim() }
      ],
      status: 'active'
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses || [],
        defaultPincode: user.defaultPincode
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 5. Request Login OTP
export async function requestLoginOtp(req, res) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number.' });
    }

    const cleanId = String(identifier).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: String(identifier).trim() }, { username: cleanId }],
      status: 'active'
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No active account found with this identifier.' });
    }

    await generateAndSendOTP(user.email, 'login');

    return res.status(200).json({
      success: true,
      message: `Login OTP sent to registered email ${user.email.replace(/(.{2})(.*)(?=@)/, '$1***')}.`,
      target: user.email
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Verify Login OTP
export async function verifyLoginOtp(req, res) {
  try {
    const { target, otp } = req.body;
    if (!target || !otp) {
      return res.status(400).json({ success: false, message: 'Target and OTP are required.' });
    }

    const verification = await verifyOTP(target, otp, 'login');
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const user = await User.findOne({ email: String(target).trim().toLowerCase(), status: 'active' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful via OTP!',
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses || [],
        defaultPincode: user.defaultPincode
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 7. Refresh Token Rotation (P1-6)
export async function refreshAccessToken(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (err) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token. Please login again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status === 'deleted') {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    // Check tokenVersion revocation
    if ((user.tokenVersion || 0) !== decoded.tokenVersion) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.status(401).json({ success: false, message: 'Session has been revoked. Please login again.' });
    }

    // Rotate tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Logout (P1-6)
export async function logout(req, res) {
  try {
    if (req.user) {
      // Invalidate existing refresh tokens by bumping tokenVersion
      await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 9. Forgot Password - Request Reset OTP
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, status: 'active' });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If an account exists, a reset code was sent.' });
    }

    await generateAndSendOTP(cleanEmail, 'reset');

    return res.status(200).json({
      success: true,
      message: `Password reset OTP sent to ${cleanEmail}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 10. Reset Password with OTP
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const verification = await verifyOTP(cleanEmail, otp, 'reset');

    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    const user = await User.findOne({ email: cleanEmail, status: 'active' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate all prior sessions
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 11. Get Current Authenticated Profile
export async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 12. Update Profile & Addresses
export async function updateProfile(req, res) {
  try {
    const { name, phone, avatar, addresses, defaultPincode } = req.body;
    const user = req.user;

    if (name) user.name = String(name).trim();
    if (phone) user.phone = String(phone).trim();
    if (avatar) user.avatar = avatar;
    if (addresses) user.addresses = addresses;
    if (defaultPincode) user.defaultPincode = String(defaultPincode).trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 13. Delete / Deactivate Account (Self-Service)
export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required to confirm account deletion.' });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Account deletion aborted.' });
    }

    await anonymizeUser(user);

    res.clearCookie('token');
    res.clearCookie('refreshToken');
    return res.status(200).json({ success: true, message: 'Your account has been deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
