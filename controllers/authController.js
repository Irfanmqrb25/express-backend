import User from "../model/userModel.js";
import jwt from 'jsonwebtoken'
import { promisify } from 'util'
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES
  })
}

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  user.password = undefined 

  res.status(statusCode).json({
    status: 'success',
    token,
    user
  })
}

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body

  const user = await User.create({
    name,
    email,
    password,
    role
  })

  createSendToken(user, 201, res)
})

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if(!email || !password){
    return next(new AppError('Please enter email & password', 400))
  }

  const user = await User.findOne({ email }).select('+password')

  if(!user || !(await user.comparePassword(password, user.password))){
    return next(new AppError('Incorect email or password', 401))
  }

  createSendToken(user, 200, res)
})

export const logout = catchAsync(async (req, res, next) => {

  res.status(200).json({
  status: 'success',
  message: 'Logged out'
})
})

export const protect = catchAsync(async (req, res, next) => {
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1]
  }

  if(!token){
    return next(new AppError('You are not logged in! Please log in to get access.', 401))
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
  
  const currentUser = await User.findById(decoded.id)
  if(!currentUser){
    return next(new AppError('The user belonging to this token does no longer exist.', 401))
  }

  req.user = currentUser
  next()
})

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)){
      return next(new AppError(`Role (${req.user.role}) is not allowed to access this resource`, 403))
    }

    next()
  }
}