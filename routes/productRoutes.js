import express from 'express'
import { protect, restrictTo } from '../controllers/authController.js'
import { canUserReview, createProductReview, deleteReview, getAdminProducts, getOneProduct, getProductReviews, getProducts, updateProduct } from '../controllers/productController.js'

const router = express.Router()

router.get('/products', getProducts)

router.route('/admin/products')
  .get(protect, restrictTo('admin'), getAdminProducts)

router.route('/products/:id')
  .get(getOneProduct)
  
router.patch('/admin/products/:id', protect, restrictTo('admin') , updateProduct)

router.
route("/reviews")
  .get(protect, getProductReviews)
  .put(protect, createProductReview)

router.
  route("/admin/reviews")
  .delete(protect, restrictTo('admin'), deleteReview)

router.get("/can_review", protect, canUserReview)

export default router