const { response } = require('express')
const dotenv=require("dotenv");
const user =require('../models/usermodel')
const categorycategory = require ("../models/categorymodel")
const product = require ("../models/productmodel")
dotenv.config();

module.exports={
    category: async (req, res) => {
        console.log("zlzlzlzlzlaaa");
        try {
          const category = req.params.id;
          console.log(category);
          const products = await product.find({ productcategory: category });

          console.log(products);
          
          
          res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: "Internal server error" });
        }
      },
    }
      
      
//     categoryshirt:async(req,res)=>{
//         try{
//             let products= await product.find({
//                 productcategory:{$eq:"shirt"}
//             })
//             // res.redirect('/shop?value='+ encodeURIComponent(products))
//             res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
            
//         }catch(err){
//             console.error(err)
//         }
//     },
//     categorytshirt:async(req,res)=>{
//         try{
//             let products= await product.find({
//                 productcategory:{$eq:"tshirt"}
//             })
//             // res.redirect('/shop?value='+ encodeURIComponent(products))
//             res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
            
//         }catch(err){
//             console.error(err)
//         }
//     },
//     categoryhoddie:async(req,res)=>{
//         try{
//             let products= await product.find({
//                 productcategory:{$eq:"hoddie"}
//             })
//             // res.redirect('/shop?value='+ encodeURIComponent(products))
//             res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
            
//         }catch(err){
//             console.error(err)
//         }
//     },
  
// }