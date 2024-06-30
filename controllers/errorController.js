import AppError from "../utils/appError.js"
import { CastError } from "mongoose"

function handleCastError(err){
  const message = `Resource not found. Invalid: ${err.path}`
  return new AppError(message, 400)
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message)

  const message = `${errors.  join(' & ')}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = err => {
  const duplicateField = Object.keys(err.keyValue)
  const value = err.keyValue[duplicateField]

  const message = `${value} is already taken. Please use another ${duplicateField}!`
  return new AppError(message, 400)
}

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401)

const handleJWTExpiredError = () => new AppError('Your token has expired! Please log in again', 401)

function sendErrorDev(err, res){
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  })
}

function sendErrorProd(err, res){
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })

  } else {
    console.error('ERROR 💥', err)

    res.status(500).json({
      status: 'error',
      message: 'something went very wrong!'
    })
  }
}

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'

  if(process.env.NODE_ENV === 'DEVELOPMENT') {
    let error = {...err}
    if(err instanceof CastError) error = handleCastError(error)

    sendErrorDev(error, res)
    
  } else if(process.env.NODE_ENV === 'PRODUCTION'){
    let error = {...err}

    if(err instanceof CastError) error = handleCastError(error)

    if(error._message === 'User validation failed') error = handleValidationErrorDB(error)
    if(error.code === 11000) error = handleDuplicateFieldsDB(error)

    if (error.name === 'JsonWebTokenError') error = handleJWTError()
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError()

    sendErrorProd(error, res)
  }
}