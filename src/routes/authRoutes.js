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

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/verifyemail/:token', verifyEmail);

// User Profile Routes (Get, Update, Delete Self)
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile)
  .delete(protect, deleteUserProfile);

// Admin Routes (Get All, Delete Specific User)
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);

export default router;