import express from 'express'
import {
  register,
  login,
  getMe,
//   updateDetails,
//   updatePassword,
//   forgotPassword,
//   resetPassword,
  logout,
  verifyEmail,
//   resendVerification,
//   enableTwoFactor,
//   disableTwoFactor,
//   getLoginHistory,
//   deleteAccount
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegistration, validateLogin, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// /**
//  * @route   POST /api/auth/register
//  * @desc    Register user
//  * @access  Public
//  */
router.post('/register', validateRegistration, handleValidationErrors, register);

// /**
//  * @route   POST /api/auth/login
//  * @desc    Login user
//  * @access  Public
//  */
router.post('/login', validateLogin, handleValidationErrors, login);

// /**
//  * @route   POST /api/auth/forgotpassword
//  * @desc    Forgot password
//  * @access  Public
//  */
// router.post('/forgotpassword', forgotPassword);

// /**
//  * @route   PUT /api/auth/resetpassword/:resettoken
//  * @desc    Reset password
//  * @access  Public
//  */
// router.put('/resetpassword/:resettoken', resetPassword);

// /**
//  * @route   GET /api/auth/verify-email/:token
//  * @desc    Verify email address
//  * @access  Public
//  */
router.get('/verify-email/:token', verifyEmail);

// /**
//  * @route   POST /api/auth/resend-verification
//  * @desc    Resend verification email
//  * @access  Public
//  */
// router.post('/resend-verification', resendVerification);

// // All routes below are protected
// router.use(protect);

// /**
//  * @route   GET /api/auth/me
//  * @desc    Get current logged in user
//  * @access  Private
//  */
router.get('/me',protect, getMe);

// /**
//  * @route   PUT /api/auth/updatedetails
//  * @desc    Update user details
//  * @access  Private
//  */
// router.put('/updatedetails', updateDetails);

// /**
//  * @route   PUT /api/auth/updatepassword
//  * @desc    Update password
//  * @access  Private
//  */
// router.put('/updatepassword', updatePassword);

// /**
//  * @route   POST /api/auth/logout
//  * @desc    Logout user
//  * @access  Private
//  */
router.post('/logout', logout);



// /**
//  * @route   POST /api/auth/disable-2fa
//  * @desc    Disable two-factor authentication
//  * @access  Private
//  */
// router.post('/disable-2fa', disableTwoFactor);

// /**
//  * @route   GET /api/auth/login-history
//  * @desc    Get user login history
//  * @access  Private
//  */
// router.get('/login-history', getLoginHistory);

// /**
//  * @route   DELETE /api/auth/account
//  * @desc    Delete user account
//  * @access  Private
//  */
// router.delete('/account', deleteAccount);

export default router;