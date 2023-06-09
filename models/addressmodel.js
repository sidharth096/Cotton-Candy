const mongoose = require('mongoose');


const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },

  name: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  state: {
    type: String
  },
  postcode: {
    type: Number
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  status: { 
    type: Boolean, 
    default: true
  },
},

  {
    timestamps: true,
  }
);

const addressmodel = mongoose.model("address", addressSchema)
module.exports = addressmodel