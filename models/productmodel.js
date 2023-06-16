const mongoose= require('mongoose');

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true,
   
  },
//   productcolor: {
//     type: String,
//   },
  productsize: {
    type: String,
    required: true,
    
  },
//   productbrand: {
//     type: String,
//     required: true,
    
//   },
  
  productpromotionalprice: {
    type: Number,
    required: true,
  },
  productregularprice: {
    type: Number,
    required: true,
  },
  productdescription: {
    type: String,
    required: true,
  },
  productquantity: {
    type: Number,
    required: true,
  },
  productimage: {
    type: Array,
    required: true
     
  },
  productcolour: {
    type: String,
    required: true,
  },
  
  productcategory: {
    type: String,
    required: true,
    // type: mongoose.Schema.Types.ObjectId,
    // ref: "category",
  },
  productdeactive: {
    type: Boolean,
    default:false,
  },
  
  productoffer: {
    type: Boolean,
    default:false,
  },


  
//   productstatus: {
//     type: Boolean,
//     default: true,
//   },
//   productquantity: {
//     type: Number,
//   },

  
});

const product = mongoose.model('product', productSchema);

module.exports = product
