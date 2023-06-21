const mongoose= require('mongoose');



const bannerSchema = mongoose.Schema({


name:{
type:String,
required:true
},
Image:{
    type: String,
    required: true,
    
},
Description:{
    type:String,
    required:true
},
status:{
    type: String,
    default:true
},
createdAt: {
    type: Date,
    default: Date.now
  }


})


const banner = mongoose.model("banner",bannerSchema)
module.exports = banner