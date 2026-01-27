import { check } from 'express-validator';
import { validateRequest } from '../middlewares/validatorMiddleware.js';

// Register Validation
export const validateRegister = [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email address').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validateRequest
];

// Login Validation
export const validateLogin = [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
    validateRequest
];

// Update Profile Validation (New)
export const validateUpdateProfile = [
    check('name', 'Name cannot be empty').optional().not().isEmpty(),
    check('email', 'Please include a valid email address').optional().isEmail(),
    check('password', 'Password must be 6 or more characters').optional().isLength({ min: 6 }),
    validateRequest
];