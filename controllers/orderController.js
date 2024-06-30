import catchAsync from "../utils/catchAsync.js";
import AppError from '../utils/appError.js'
import Order from "../model/orderModel.js";
import Product from "../model/productModel.js";

export const newOrder = catchAsync(async (req, res, next) => {
  const { 
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo
  } = req.body

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxAmount,
    shippingAmount,
    totalAmount,
    paymentMethod,
    paymentInfo,
    user: req?.user?._id
  })


  res.status(200).json({
    status: 'success',
    order
  })
})

export const myOrder = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id })

  // if(!orders){
  //   return next(new AppError('No orders found', 404))
  // }

  res.status(200).json({
    status: 'success',
    results: orders.length,
    orders
  })
})

export const getOrderDetails = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email')

  if(!order){
    return next(new AppError('No order found with that id', 404))
  }

  res.status(200).json({
    status: 'success',
    order
  })
})

//Admin
export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()

  res.status(200).json({
    status: 'success',
    results: orders.length,
    orders
  })
})

//Admin
export const updateOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if(!order){
    return next(new AppError('No order found with that id', 404))
  }

  if(order.orderStatus === 'Sudah Diterima'){
    return next(new AppError('You have already delivered this order', 400))
  }

  order.orderItems.forEach(async (item) => {
    const product = await Product.findById(item.product.toString())
    if(!product){
      return next(new AppError('No product found with that id', 404))
    }
    product.stock = product.stock - item.quantity
    await product.save({ validateBeforeSave: false })
  })

  order.orderStatus = req.body.status
  order.deliveredAt = Date.now()

  await order.save()

  res.status(200).json({
    status: 'success'
  })
})

//ADMIN
export const deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)

  if(!order){
    return next(new AppError('No order found with that id', 404))
  }

  await order.deleteOne()

  res.status(200).json({
    status: 'success'
  })
})


async function getSalesData(startDate, endDate){
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id:{
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        totalSales: { $sum: '$totalAmount' },
        numOrder: { $sum: 1 }
      }
    }
  ])

  const salesMap = new Map()
  let totalSales = 0
  let totalNumOrders = 0

  salesData.forEach((entry) => {
    const date = entry._id.date
    const sales = entry.totalSales
    const numOrder = entry.numOrder
    
    salesMap.set(date, { sales, numOrder })
    totalSales += sales
    totalNumOrders += numOrder
  })
  
  const datesBetween = getDatesBetween(startDate, endDate)

  const finalSalesData = datesBetween.map((date) => ({
    date,
    sales: (salesMap.get(date) || { sales: 0 }).sales,
    numOrder: (salesMap.get(date) || { numOrder: 0 }).numOrder
  }))

  return { salesData: finalSalesData, totalSales, totalNumOrders }
}

function getDatesBetween(startDate, endDate){
  const dates = []

  let currentDate = new Date(startDate)

  while(currentDate <= new Date(endDate)){
    const formattedDate = currentDate.toISOString().split('T')[0]

    dates.push(formattedDate)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return dates
}

export const getSales = catchAsync(async (req, res, next) => {
  const startDate = new Date(req.query.startDate)
  const endDate = new Date(req.query.endDate)

  startDate.setUTCHours(0, 0, 0, 0)
  endDate.setUTCHours(23, 59, 59, 999)

  const { salesData, totalSales, totalNumOrders } = await getSalesData(startDate, endDate)

  res.status(200).json({
    status: 'success',
    sales: salesData, 
    totalSales, 
    totalNumOrders
  })
})