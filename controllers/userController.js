import User from "../model/userModel.js"
import AppError from "../utils/appError.js"
import catchAsync from "../utils/catchAsync.js"

export const getMe = catchAsync(async (req, res, next) => {
  const user = req.user

  res.status(200).json({
    status: 'success',
    user
  })
})

//ADMIN CONTROLLER

const filterObj = (obj, ...allowedFields) => {
  const newObj = {}
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)){
      newObj[el] = obj[el]
    }
  })

  return newObj
}

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find()

  res.status(200).json({
    status: 'success',
    results: users.length,
    users
  })
})

export const getUserDetail = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)

  if(!user){
    return next(new AppError(`User not found with id: ${req.params.id}`, 404))
  }

  res.status(200).json({
    status: 'success',
    user
  })
})

export const updateUserByAdmin = catchAsync(async (req, res, next) => {

  if(req.body.password){
    return next(new AppError('This route is not for password updates. please use /updatePassword', 400))
  }

  const filteredBody = filterObj(req.body, 'name', 'email', 'role')

  // 2) filtered out unwanted fields names that are not allowed to be updated
  const updatedUser = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true, 
  })

  res.status(200).json({
    status: 'success',
    user: updatedUser
  })
})

export const deleteUserByAdmin = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id)

  if(!user){
    return next(new AppError(`User not found with id: ${req.params.id}`, 404))
  }

  res.status(200).json({
    status: 'success'
  })
})