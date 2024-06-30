import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  shippingInfo: {
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  // Harusnya Pake Parent Poppulates
  orderItems: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: String,
        required: true
      }, 
      product: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Product'
      }
    }
  ],
  paymentMethod: {
    type: String,
    required: [true, 'Please select the payment method'],
    enum: {
      values: ['COD', 'Card'],
      message: 'Please select: COD or Card'
    }
  },
  paymentInfo: {
    id: String,
    status: String
  },
  itemsPrice: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  shippingAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: {
      values: ['Diproses', 'Dalam Perjalanan', 'Sudah Diterima'],
      message: 'Please select correct order status'
    },
    default: 'Diproses'
  },
  deliveredAt: Date
},
{ timestamps: true })

export default mongoose.model('Order', orderSchema)