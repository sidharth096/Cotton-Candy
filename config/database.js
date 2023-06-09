const dotenv=require('dotenv');
const mongoose=require('mongoose');

dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports=connectDB;