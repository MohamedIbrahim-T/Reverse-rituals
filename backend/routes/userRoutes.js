const express = require('express');
const router = express.Router();
const { authUser, getUserProfile, registerUser, makeUserAdmin, updateUserProfile, forgotPassword, resetPassword, getAllUsers } = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

router.post('/', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/all', protect, admin, getAllUsers);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/:id/admin').put(protect, admin, makeUserAdmin);

module.exports = router;
