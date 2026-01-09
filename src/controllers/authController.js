
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';

// Helper function to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // 2. PREPARE the user (Do not save yet)
    const user = new User({
      name,
      email,
      password,
    });

    // 3. Generate the token on the user instance
    const verificationToken = user.getVerificationToken();

    // 4. SAVE the user to DB (This triggers the pre-save hash automatically)
    await user.save();

    // 5. Construct URL and Message
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the registration of an account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${verificationUrl}`;

    try {
      // FOR DEV: Log to console
      console.log('Verification Email Sent to Console (Simulated):');
      console.log(message);

      res.status(200).json({
        success: true,
        data: 'Email sent. Please check your console/email to verify account.',
      });
    } catch (error) {
      // If email sending fails, we delete the user so they can try again
      await user.deleteOne();
      res.status(500);
      throw new Error('Email could not be sent');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email (select password since it's hidden)
    const user = await User.findOne({ email }).select('+password');

    // 2. Check if user exists AND if password matches
    if (user && (await user.matchPassword(password))) {
      
      // 3. Check if email is verified
      if (!user.isVerified) {
        res.status(401);
        throw new Error('Please verify your email address to log in.');
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401); // Unauthorized
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    // The user is already attached to the request by the 'protect' middleware
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    };

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    // 1. Get the user from the database (req.user is set by 'protect')
    const user = await User.findById(req.user._id);

    if (user) {
      // 2. Update fields OR keep existing ones if not sent
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      // 3. Handle password update separately (only if sent)
      if (req.body.password) {
        user.password = req.body.password; 
        // Mongoose pre-save middleware will automatically hash this!
      }

      // 4. Save the updated user
      const updatedUser = await user.save();

      // 5. Respond with the new data + a fresh token
      // (Fresh token is good practice in case role/email changed)
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user profile (Self)
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserProfile = async (req, res, next) => {
  try {
    // req.user is set by the 'protect' middleware
    const user = await User.findById(req.user._id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({ message: 'User removed by Admin' });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify user by email
// @route   PUT /api/auth/verifyemail/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    // Get token from URL and hash it (to match DB)
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with matching token and ensure it hasn't expired
    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    // Verify user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    // Log them in immediately (send token)
    res.status(200).json({
      success: true,
      data: 'Email Verified Successfully!',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};