import crypto from 'crypto';
import User from '../models/User.js';
import redisClient from '../config/redis.js';
import generateToken from "../utils/generateToken.js";


// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    const user = new User({
      name,
      email,
      password,
    });

    const verificationToken = user.getVerificationToken();

    await user.save();

    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verifyemail/${verificationToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the registration of an account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${verificationUrl}`;

    try {
      console.log('Verification Email Sent to Console (Simulated):');
      console.log(message);

      res.status(200).json({
        success: true,
        data: 'Email sent. Please check your console/email to verify account.',
      });
    } catch (error) {
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

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {

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
      res.status(401);
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
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      //Invalidate the cache
      await redisClient.del(`user:${updatedUser._id}`);

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
    const user = await User.findById(req.user._id);

    if (user) {
      await user.deleteOne();
      // Invalidate cache on delete
      await redisClient.del(`user:${user._id}`);
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
      // Invalidate cache on admin delete
      await redisClient.del(`user:${user._id}`);
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
    const verificationToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({
      verificationToken,
      verificationTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email Verified Successfully!',
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};