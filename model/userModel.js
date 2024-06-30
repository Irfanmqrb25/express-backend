import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [50, 'Your name cannot exceed 50 character']
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please enter your password'],
    minLength: [6, 'Password must be longer than 6 character'],
    select: false
  },
  avatar: {
    public_id:  String,
    url: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date
},
{ timestamps: true })

userSchema.pre('save', async function(next){
  if(!this.isModified('password')){
    next()
  }

  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
} 

export default mongoose.model('User', userSchema)