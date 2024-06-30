import express from 'express'
import { protect, restrictTo } from '../controllers/authController.js'
import { deleteUserByAdmin, getAllUsers, getMe, getUserDetail, updateUserByAdmin } from '../controllers/userController.js'

const router = express.Router()

router.get('/me', protect, getMe)

router.get('/admin/users', protect, restrictTo('admin'), getAllUsers)

router.route('/admin/users/:id')
  .get(protect, restrictTo('admin'), getUserDetail)
  .patch(protect, restrictTo('admin'), updateUserByAdmin)
  .delete(protect, restrictTo('admin'), deleteUserByAdmin)

export default router