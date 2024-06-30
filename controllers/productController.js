import Product from "../model/productModel.js";
import ApiFeatures from "../utils/apiFeatures.js";
import catchAsync from "../utils/catchAsync.js";
import Order from '../model/orderModel.js'

export const getProducts = catchAsync(async (req, res, next) => {
    
  const resPerPage = 4
  let apiFilters = new ApiFeatures(Product, req.query)
  .search()
  .filter()
  
  let products = await apiFilters.query
  const filteredProductsCount = products.length
  
  apiFilters.paginate(resPerPage)
  products = await apiFilters.query.clone()

  res.status(200).json({
    message: "success",
    results: products.length,
    resPerPage,
    filteredProductsCount,
    products
  });
})

export const getOneProduct = async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews.user')

  if(!product) {
    return console.log('Product not found')
  }

  res.status(200).json({
    message: "success",
    product
  });
}

//ADMIN
export const getAdminProducts = async (req, res, next) => {
  const products = await Product.find()

  res.status(200).json({
    message: "success",
    products
  });
}

//ADMIN
export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })

  if(!product) {
    return next(new AppError('no product found with that id', 404))
  }

  res.status(200).json({
    message: "success",
    product
  });
})

export const createProductReview = catchAsync(async (req, res, next) => {
  const { rating, comment, productId } = req.body

  const review = {
    user: req.user._id,
    rating: rating * 1,
    comment,
  }

  const product = await Product.findById(productId)

  if(!product) {
    return next(new AppError('no product found with that id', 404))
  }

  const isReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  )

  if(isReviewed){
    product.reviews.forEach((review) => {
      if(review.user.toString() === req.user._id.toString()){
        review.rating = rating
        review.comment = comment
      }
    })
  } else {
    product.reviews.push(review)
    product.numOfReviews = product.reviews.length
  }

  product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

  await product.save({ validateBeforeSave: false })

  res.status(200).json({
    message: "success"
  });
})

//ADMIN
export const getProductReviews = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.query.id).populate('reviews.user')

  if(!product) {
    return next(new AppError('no product found with that id', 404))
  }

  res.status(200).json({
    status: 'success',
    reviews: product.reviews
  })
})

//ADMIN
export const deleteReview = catchAsync(async (req, res, next) => {
  let product = await Product.findById(req.query.productId)

  if(!product) {
    return next(new AppError('no product found with that id', 404))
  }

  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  )

  const numOfReviews = reviews.length

  const ratings = 
    numOfReviews === 0 
    ? 0 
    : product.reviews.reduce((acc, item) => item.rating + acc, 0) / numOfReviews

  product = await Product.findByIdAndUpdate(
    req.query.productId, 
    { reviews, numOfReviews, ratings }, 
    { new: true }
  )

  res.status(200).json({
    message: "success",
    product
  });
})

export const canUserReview = catchAsync(async (req, res, next) => {
  const orders = await Order.find({
    user: req.user._id,
    'orderItems.product': req.query.productId
  })

  if(orders.length === 0){
    return res.status(200).json({ canReview: false })
  }

  res.status(200).json({
    canReview: true
  })
})