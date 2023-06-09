
const  mongoose =require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phonenumber: { type: String,
     required: true,
      unique: true },
      
      status: { type: Boolean, default: true },
   block:{type: Boolean,default:false}   
});

const User = mongoose.model('User', UserSchema);

module.exports=User
