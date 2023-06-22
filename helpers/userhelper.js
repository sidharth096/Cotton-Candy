
const mongoose = require("mongoose");
const user = require("../models/usermodel")
const bcrypt = require('bcrypt')
const twilioFunctions = require('../config/twilio')
const product = require('../models/productmodel')
const Cart = require('../models/cartmodel')
const addressModal = require('../models/addressmodel')
const orderModal = require('../models/ordermodels')
const validatehelper = require('../helpers/validatehelper');
const ObjectId=require('mongoose').Types.ObjectId
const Razorpay = require('razorpay');


const key_id=process.env.key_id;
const key_secret=process.env.key_secret;
var instance = new Razorpay({
  key_id,
  key_secret
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken)

const dotenv = require("dotenv");
const { response } = require("express");
dotenv.config();
module.exports = {
  dosignup: async (req,res)=> {

    return new Promise(async (resolve, reject)=> {
      try {
        user.findOne({ email: body.email }).then(async(oldUser, err) => {
          if (err) {
            reject(err);
            } else {

            if (oldUser) {
              resolve({ status: true, user: null });
            }
            else {

              req.session.signupdata=req.body
              let otpsend=await validatehelper.checkotpSignup(req.body.mobile)

              if(otpsend.status==true){
                let phonenumber=req.body.mobile

                res.render('shop/verifyotpsignup.ejs',{phonenumber} )
                
              }             
          
            }

          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  dologin: function (body) {
    return new Promise((resolve, reject) => {
      try {
        user.findOne({ email: body.email }).then((validUser, err) => {

          if (err) {
            reject(err);
          } else {

            if (validUser) {
              bcrypt.compare(body.password, validUser.password).then((isPasswordMatch, err) => {
                if (err) {
                  reject(err);
                } else {
                  if (isPasswordMatch) {
                    resolve({ status: true, user: validUser });
                  } else {
                    let msg = "Incorrect password"
                    resolve({ status: false, msg });
                  }
                }
              });
            } else {
              console.log("No User Found!");
              let msg = "Email does not exist"
              resolve({ status: false, msg });
            }
          }
        });
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  checkotp: function (body) {

    return new Promise((resolve, reject) => {
      try {
        user.findOne({ phonenumber: body.phonenumber }).then((validuser, err) => {

          if (err) {
            reject(err)
          }
          else {
            if (validuser) {
              twilioFunctions.generateOTP(validuser.phonenumber);
              // const msg1 = "OTP SENT!!";
              let msg = "otp send"
              resolve({ status: true, validuser, msg })

            } else {
              let msg = "User not registered"
              resolve({ status: false, msg });
            }

          }
        })
      }
      catch {

      }
    })
  },
  checkotpForgot: function (body) {

    return new Promise((resolve, reject) => {
      try {
        user.findOne({ phonenumber: body.phonenumber }).then((validuser, err) => {

          if (err) {
            reject(err)
          }
          else {
            if (validuser) {
              twilioFunctions.generateOTP(validuser.phonenumber);
              // const msg1 = "OTP SENT!!";
              let msg = "otp send"
              resolve({ status: true, validuser, msg })

            } else {
          
              let msg = "User not registered"
              resolve({ status: false, msg });
            }

          }
        })
      }
      catch {

      }
    })
  },



  verifyOTP: async (req, res) => {
    const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;
    const phonenumber = req.body.phone;
    try {
      client.verify.v2.services(`VA8b01b7f5e6f1671b4ddf2e23e407544e`).verificationChecks.create({
        to: `+91${phonenumber}`,
        code: otp
      }).then(async (verificationChecks) => {
        if (verificationChecks.status === "approved") {
          let user1 = await user.findOne({ phonenumber: phonenumber });

          req.session.user = true
          req.session.userid = user1
          res.redirect("/");
        }
        else {
          let msg = "Incorrect OTP"
          res.render('shop/verifyotp.ejs', { msg, phonenumber })
        }

      });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message,
      });
    }
  },
  verifyOTPForget: async (req, res) => {
    const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;
    const phonenumber = req.body.phone;
    try {
      client.verify.v2.services(`VA8b01b7f5e6f1671b4ddf2e23e407544e`).verificationChecks.create({
        to: `+91${phonenumber}`,
        code: otp
      }).then(async (verificationChecks) => {
        if (verificationChecks.status === "approved") {
          let user1 = await user.findOne({ phonenumber: phonenumber });


          res.render('shop/changepassword.ejs', { user1 })
        }
        else {
          let msg = "Incorrect OTP"
          res.render('shop/verifyotpforgot.ejs', { msg, phonenumber })
        }

      });
    } catch (error) {
      console.error(error);
      res.render("catchError", {
        message: error.message,
      });
    }
  },
  productdetail: async (body) => {
    try {
      let productid = body
      let productdetails = await product.findById(productid)
      return productdetails
    } catch (error) {

    }
  },
  resetpasspost: async (body, userid) => {
    try {

      var saltRounds = 10;
      var password = body.password.toString();
      bcrypt.hash(password, saltRounds, async function (err, newpassword) {
        if (err) {
          reject(err);
        } else {
    
          let userdata = await user.findById(userid);
          userdata.password = newpassword; // Set the new password on the user object
          await userdata.save(); // Save the updated user object to the database

        }
      });
    } catch (error) {
      // Handle errors here
    }
  },
  addToCart: async (userId,body) => {
    try {

      if(!userId){ 
        return{response:false,}
      }
      let productId=body.productid
      const productdetail = await product.findById(productId);
      if (!productdetail) {
        throw new Error("Product not found");
      }

      const quantity = productdetail.productquantity;

      if (quantity < 1) {
        return{response:true,limit:true, msg:"Product out of stock"}
      }
 
      let added;
      const cartuser = await Cart.findOne({ user: userId });
      if (cartuser) {
        added = await Cart.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
        
        
      }

      const cart = await Cart.findOneAndUpdate(
        { user: userId, "products.productId": { $ne: productId } },
        { $push: { products: { productId, quantity: 1 } } },
        { new: true }
      );
 
      if (!cart && !added) {
    
        await Cart.updateOne(
          { user: userId },
          { $push: { products: { productId, quantity: 1 } } },
          { upsert: true }
        );
        throw new Error("Could not update cart");
      }
      
      return {response:true}
    } catch (error) {
      console.error(error);
    }
  },



  removeCartitem: async (userId, productId) => {
    try {

      const userProduct = await product.findById(productId);

      if (!userProduct) {
        return { status: false, message: "product not found" };
      }

      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        const itemIndex = cart.products.findIndex((item) =>
          item.productId.equals(productId)
        );

        if (itemIndex > -1) {
          cart.products.splice(itemIndex, 1);
          await cart.save();
          return { status: true, message: "product removed from cart" };
        } else {
          return { status: false, message: "product not found in cart" };
        }
      } else {
        return { status: false, message: "cart not found" };
      }
    } catch (error) {
      console.error(error);
    }
  },

  changeProductQuantity:async(body)=>{

    try{
      body.count=parseInt(body.count)
      body.quantity=parseInt(body.quantity)
      const productId=body.product
      const cartId=body.cart
      const count=body.count
      let Product=await product.findById(productId)
      let productquantity=Product.productquantity
      return new Promise((resolve,reject)=>{
        if (body.count == -1 && body.quantity == 1) {
          Cart
            .updateOne(
              { _id: cartId },
              { $pull: { products: { productId: productId } } }
            )
            .then((response) => {
              resolve({response:response,remove:true});
            });
        }
       else if(productquantity==body.quantity&& body.count==1){
          resolve({response:response,limit:true});

        }
     
        else{
          Cart.updateOne({_id:cartId,'products.productId':productId},{ $inc:{'products.$.quantity':count}}).then((response)=>{
            resolve(false)
          })
        }
      })
     
      
    }catch(error){
      console.log(error);
    }
    
    },
    getCartTotal: async(userId)=>{
      try {
        const cart = await Cart.findOne({ user: userId }).populate('products.productId')
        if (!cart) {
          return { status: false, message: "cart not found" };
        }
        let total = 0;
        cart.products.forEach((item) => {
        
          total += item.productId.productpromotionalprice * item.quantity;


        });
        total=parseInt(total)
        return total;
      } catch (error) {
        console.error(error);
        return { status: false, message: "cart not found" };
      }
      },
    
    addAddress:async(body,userId)=>{

      await addressModal.create({
          name:body.name,
          address:body.address,
          city:body.city,
          state:body.state,
          postcode:body.postcode,
          phone:body.phonenumber,
          email:body.email,
          user: userId 
          }),
        { upsert: true }
      

      return({status:true})
           

    },
    deleteaddress: async (body) => {
      try {
 
        let addressid = body;
        let address=await addressModal.findById(addressid);
        address.status=false
        address.save()
        return({status:true})
      } catch (error) {}
    },
    placeOrder:async(body,userId,total)=>{

      let addressId=body.address_id
      const cart = await Cart.findOne({ user: userId }).populate('products.productId')
      const adrs = await addressModal.aggregate([
        {
          $match:{user:new ObjectId(userId)}
        },
       {
        $unwind:'$address'
       },{
        $match:{"address._id": new ObjectId(addressId) }
       }
      ])

  let orderstatus = body.payment_method == 'COD' ? 'confirmed' : 'pending';  
  await orderModal.updateOne(
    { user: userId }, // The filter to find the document to update (matching the "user" field with the userId)
    { // The update to be applied to the document
      shippingAddress: {
        name: adrs[0].address.name,
        address: adrs[0].address.address,
        city: adrs[0].address.city,
        state: adrs[0].address.state,
        phone: adrs[0].address.phonenumber
      },
      items :cart.products,
      payment_method:body.payment_method,
      total: total,
      status:orderstatus
     // Add the "total" field with the desired value
    },
    { upsert: true } // Options object specifying "upsert: true" to insert a new document if no match is found
  );
 return({status:true})
  
   },
   clearCart:async(userId)=>{
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { products: [] } }, 
      { new: true })
   },


generaterazorpay:async(orderId,totalAmount)=>{

  console.log(totalAmount);
  try {

    // var instance = new Razorpay({ key_id: 'rzp_test_gFlxCSnUJ3aK5l', key_secret: 'nvm1ozXmKUEnyqNOjDJCMY80' })
    var options = {
      amount: totalAmount*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: ""+orderId
    };

    const order = await instance.orders.create (options) 
      return order;
    
  } catch (error) {
    
  }
},
getCartCount: (userId) => {
  return new Promise(async (resolve, reject) => {
      let cart= await Cart.findOne({ user: userId });
      if(cart){
      var  cartCount = cart.products.length;
      }
      resolve(cartCount)
    })
}



}


