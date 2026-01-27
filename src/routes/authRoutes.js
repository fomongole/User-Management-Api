import express from 'express';
import {
  register,
  login,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  deleteUserProfile,
  deleteUser,
  verifyEmail
} from '../controllers/authController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

import {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} from '../validators/authValidators.js';

const router = express.Router();

// --- Public Routes ---
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.put('/verifyemail/:token', verifyEmail);

// --- Private Routes ---
router
    .route('/profile')
    .get(protect, getUserProfile)
    .put(protect, validateUpdateProfile, updateUserProfile)
    .delete(protect, deleteUserProfile);

// --- Admin Routes ---
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;