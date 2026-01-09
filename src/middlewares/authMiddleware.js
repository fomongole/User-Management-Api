import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user was actually found!
      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error(error);
      // If the error was already thrown above (401), keep it. 
      // Otherwise set to 401 for token failure.
      if (res.statusCode !== 401) {
        res.status(401);
      }
      // If we manually threw "user not found", pass that message. 
      // Otherwise pass generic token failed.
      throw new Error(error.message === 'Not authorized, user not found' ? error.message : 'Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};