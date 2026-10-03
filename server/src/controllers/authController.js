import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { generateAndSendOTP, verifyOTP } from '../services/otpService.js';

// Random avatars preset (12 distinct avatars)
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

function getRandomAvatar() {
  const index = Math.floor(Math.random() * AVATAR_PRESETS.length);
  return AVATAR_PRESETS[index];
}

function generateToken(user) {
  const secret = process.env.JWT_ACCESS_SECRET || 'eshop_access_secret_super_secure_key_12345_jwt';
  return jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    secret,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '7d' }
  );
}

// Direct Proper Registration
export async function register(req, res) {
  try {
    const { name, username, email, phone, password, avatar } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

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

    // Create user
    const allocatedAvatar = avatar || getRandomAvatar();
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      avatar: allocatedAvatar,
      emailVerified: true,
      status: 'active'
    });

    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to E-Shop.',
      token,
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

// 1. Register: Request OTP
export async function registerRequest(req, res) {
  try {
    const { name, username, email, phone, password } = req.body;

    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Validation rules
    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

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

    // Send OTP to email
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

// 2. Register: Verify OTP & Complete Registration
export async function registerVerify(req, res) {
  try {
    const { name, username, email, phone, password, otp } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Verify OTP
    const verification = await verifyOTP(cleanEmail, otp, 'register');
    if (!verification.valid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with random avatar preset
    const allocatedAvatar = getRandomAvatar();
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      role: 'customer',
      avatar: allocatedAvatar,
      emailVerified: true,
      status: 'active'
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to E-Shop.',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 3. Multi-Identifier Login (Username, Email, or Phone)
export async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide identifier and password.' });
    }

    const cleanId = identifier.trim().toLowerCase();

    // Find by email, username, or phone
    const user = await User.findOne({
      $or: [
        { email: cleanId },
        { username: cleanId },
        { phone: identifier.trim() }
      ],
      status: 'active'
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        defaultPincode: user.defaultPincode
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 4. Request Login OTP
export async function requestLoginOtp(req, res) {
  try {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide an email or phone number.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: cleanId }, { phone: identifier.trim() }, { username: cleanId }],
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

// 5. Verify Login OTP
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

    const user = await User.findOne({ email: target.trim().toLowerCase(), status: 'active' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful via OTP!',
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        defaultPincode: user.defaultPincode
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 6. Forgot Password - Request Reset OTP
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, status: 'active' });

    if (!user) {
      // Security measure: Do not disclose if email exists
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

// 7. Reset Password with OTP
export async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
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
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully! Please login with your new password.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// 8. Get Current Authenticated Profile
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

// 9. Update Profile & Addresses
export async function updateProfile(req, res) {
  try {
    const { name, phone, avatar, addresses, defaultPincode } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (addresses) user.addresses = addresses;
    if (defaultPincode) user.defaultPincode = defaultPincode.trim();

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

// 10. Delete / Deactivate Account
export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Account deletion aborted.' });
    }

    user.status = 'deleted';
    user.name = 'Anonymized User';
    user.email = `deleted_${user._id}@eshop.local`;
    user.phone = `deleted_${user._id}`;
    user.username = `deleted_${user._id}`;
    await user.save();

    res.clearCookie('token');
    return res.status(200).json({ success: true, message: 'Your account has been deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
