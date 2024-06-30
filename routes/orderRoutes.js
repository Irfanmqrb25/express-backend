import express from 'express'
import { protect, restrictTo } from '../controllers/authController.js'
import { deleteOrder, getAllOrders, getOrderDetails, getSales, myOrder, newOrder, updateOrder } from '../controllers/orderController.js'

const router = express.Router()

router.post('/orders/new', protect, newOrder)
router.get('/me/order/:id', protect, getOrderDetails)
router.get('/me/orders', protect, myOrder)

router.get('/admin/get_sales', protect, restrictTo('admin'), getSales)

router.get('/admin/orders', protect, restrictTo('admin'), getAllOrders)

router
  .route('/admin/orders/:id')
  .patch(protect, restrictTo('admin'), updateOrder)
  .delete(protect, restrictTo('admin'), deleteOrder)


export default router