import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import redisClient from '../config/redis.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 1. CHECK REDIS CACHE
      const cacheKey = `user:${decoded.id}`;
      const cachedUser = await redisClient.get(cacheKey);

      if (cachedUser) {
        req.user = JSON.parse(cachedUser);
        return next();
      }

      // 2. IF MISS, CHECK MONGODB
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      // 3. SAVE TO CACHE (Expires in 1 hour)
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(req.user));

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  } else {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};