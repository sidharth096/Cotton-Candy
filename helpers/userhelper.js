
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


var instance = new Razorpay({
  key_id: 'rzp_test_kk1KzL6j3Vt8x4',
  key_secret: 'KOSqPmO7KQ70pBJpFCJKMYwB',
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken)

const dotenv = require("dotenv");
const { response } = require("express");
dotenv.config();
module.exports = {
  dosignup: async (req,res)=> {
    console.log("2");
    console.log(req.body);
    // console.log(user.find());
    return new Promise(async (resolve, reject)=> {
      try {
        user.findOne({ email: body.email }).then(async(oldUser, err) => {
          if (err) {
            reject(err);
            } else {
              console.log("3");
            if (oldUser) {
              resolve({ status: true, user: null });
            }
            else {
              console.log("4");
              console.log(body.mobile);
              req.session.signupdata=req.body
              console.log(req.session.signupdata);
              let otpsend=await validatehelper.checkotpSignup(req.body.mobile)
              console.log("7");
              console.log(otpsend);
              if(otpsend.status==true){
                let phonenumber=req.body.mobile
                console.log("8");
                console.log(phonenumber);
                console.log(otpsend.msg);
                res.render('shop/verifyotpsignup.ejs',{phonenumber} )
                // validatehelper.verifyOTPSignup(body.mobile)
              }
             
              // var saltRounds = 10;
              // var password = body.password.toString();
              // bcrypt.hash(password, saltRounds, async function (err, newpassword) {
              //   if (err) {
              //     reject(err);
              //   } else {
              //     var newUser = new user({
              //       name: body.name,
              //       email: body.email,
              //       password: newpassword,
              //       phonenumber: body.mobile,
              //       status: false

              //     });
                  //  newUser.save().then((err, savedUser)=> {
                  //   if (err) { 
                  //     reject(err);
                  //   } else {

                  //     resolve({ status: false, user: savedUser });
                  //   }
                  // });
                //   var savedUser = await newUser.save();
                //   resolve({ status: false, user: savedUser });
                // }
              // });
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
              // if (true) {
              bcrypt.compare(body.password, validUser.password).then((isPasswordMatch, err) => {
                if (err) {
                  reject(err);
                } else {
                  if (isPasswordMatch) {
                    resolve({ status: true, user: validUser });
                  } else {
                    console.log("Login Failed");
                    let msg = "Incorrect password"
                    resolve({ status: false, msg });
                  }
                }
              });
              // } else {
              //   console.log("User account is not active.");
              //   resolve({ status: false });
              // }
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
              console.log(validuser);
              twilioFunctions.generateOTP(validuser.phonenumber);
              // const msg1 = "OTP SENT!!";
              let msg = "otp send"
              resolve({ status: true, validuser, msg })

            } else {
              console.log("no user");
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
              console.log(validuser);
              twilioFunctions.generateOTP(validuser.phonenumber);
              // const msg1 = "OTP SENT!!";
              let msg = "otp send"
              resolve({ status: true, validuser, msg })

            } else {
              console.log("no user");
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

  // verifyOtp: async (req, res) => {
  //   try {
  //     const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;
  //     const phonenumber = req.body.phone;
  //     console.log(`Verifying OTP ${otp} for ${phonenumber}`);
  //     client.verify.v2.services('VA78f0d5744013a723118798df8539c757').verificationChecks.create({
  //       to: `+91${phonenumber}`,
  //       code: otp
  //     }).then(async (verificationCheck) => {
  //       console.log(`Verification check status: ${verificationCheck.status}`);
  //       if (verificationCheck.status === "approved") {
  //         const user1 = await user.findOne({ phonenumber });
  //         if (!user1) {
  //           console.error(`User not found with phone number ${phonenumber}`);
  //           res.render("shop/verifyotp", { msg2: "User not registered", phone: phonenumber });
  //         } else if (!user1.status) {
  //           console.error(`Account is blocked for user ${user1._id}`);
  //           res.render("shop/verifyotp", { msg2: "Account is blocked...Unable to login", phone: phonenumber });
  //         } else {
  //           console.log(`User ${user1._id} logged in with phone number ${phonenumber}`);
  //           req.session.login = true;
  //           req.session.user = user1;
  //           res.redirect("/");
  //         }
  //       } else {
  //         console.error(`Incorrect OTP for ${phonenumber}`);
  //         res.render("shop/verifyotp", { msg2: "INCORRECT OTP!!", phone: phonenumber });
  //       }
  //     }).catch((error) => {
  //       console.error(`Failed to verify OTP for ${phonenumber}: ${error.message}`);
  //       res.render("shop/verifyotp", {
  //         msg2: "Error verifying OTP, please try again",
  //         phone: phonenumber
  //       });
  //     });
  //   } catch (error) {
  //     console.error(`Error verifying OTP for ${phonenumber}: ${error.message}`);
  //     res.render("shop/verifyotp", {
  //       msg2: "Error verifying OTP, please try again",
  //       phone: phonenumber
  //     });
  //   }
  // },


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
          // if (!user1) {
          //   console.error(`User not found with phone number ${phonenumber}`);
          //   res.render("shop/verifyotp", { msg2: "User not registered", phone: phonenumber });
          // } else {
          console.log(`User ${user1._id} logged in with phone number ${phonenumber}`);
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

          console.log(`User ${user1._id} logged in with phone number ${phonenumber}`);

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
      console.log(productdetails);
      return productdetails
    } catch (error) {

    }
  },
  resetpasspost: async (body, userid) => {
    try {
      console.log("hhhhhhhhhhhh");
      console.log(body.password);
      console.log(userid);
      var saltRounds = 10;
      var password = body.password.toString();
      bcrypt.hash(password, saltRounds, async function (err, newpassword) {
        if (err) {
          reject(err);
        } else {
          console.log(newpassword);
          console.log("jjk");
          let userdata = await user.findById(userid);
          userdata.password = newpassword; // Set the new password on the user object
          await userdata.save(); // Save the updated user object to the database
          console.log("sss");
        }
      });
    } catch (error) {
      // Handle errors here
    }
  },
  addToCart: async (userId,body) => {
    try {

      console.log(body);
      console.log(userId);
      console.log(body.productid);
      if(!userId){ 
        return{response:false}
      }
      let productId=body.productid
      const productdetail = await product.findById(productId);
      console.log(productdetail);
      if (!productdetail) {
        throw new Error("Product not found");
      }

      const quantity = productdetail.productQuantity;

      if (quantity < 1) {
        return false;
      }
      console.log("hello");
      let added;
      const cartuser = await Cart.findOne({ user: userId });
      if (cartuser) {
        added = await Cart.updateOne(
          { user: userId, "products.productId": productId },
          { $inc: { "products.$.quantity": 1 } }
        );
        
        
      }
      console.log("kkku");
      const cart = await Cart.findOneAndUpdate(
        { user: userId, "products.productId": { $ne: productId } },
        { $push: { products: { productId, quantity: 1 } } },
        { new: true }
      );
      console.log(cart);
      console.log("lllll");

      console.log(added);
      if (!cart && !added) {
        console.log("hhhh");
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
      console.log(productId);
      console.log(userId);
      const userProduct = await product.findById(productId);
      console.log(userProduct);
      if (!userProduct) {
        return { status: false, message: "product not found" };
      }

      const cart = await Cart.findOne({ user: userId });
      console.log(cart);
      if (cart) {
        const itemIndex = cart.products.findIndex((item) =>
          item.productId.equals(productId)
        );
        console.log(itemIndex);
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
      return new Promise((resolve,reject)=>{
        if (body.count == -1 && body.quantity == 1) {
          console.log("hhhh");
          Cart
            .updateOne(
              { _id: cartId },
              { $pull: { products: { productId: productId } } }
            )
            .then((response) => {
              resolve({response:response,remove:true});
            });
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
        console.log("sidharth");
        const cart = await Cart.findOne({ user: userId }).populate('products.productId')
        console.log(cart);
        if (!cart) {
          return { status: false, message: "cart not found" };
        }
        let total = 0;
        cart.products.forEach((item) => {
        
          total += item.productId.productpromotionalprice * item.quantity;


        });
        total=parseInt(total)
        console.log("aaalo");
        console.log(total);
        return total;
      } catch (error) {
        console.error(error);
        return { status: false, message: "cart not found" };
      }
      },
    checkout:async(body)=>{
      try {
       
      } catch (error) {
        
      }
    },
    addAddress:async(body,userId)=>{
      console.log(userId);
      


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
      
      console.log("yes");
      return({status:true})
           

    },
    deleteaddress: async (body) => {
      try {
        console.log("popopopo");
        console.log(body);
        let addressid = body;
        console.log(addressid);
        let address=await addressModal.findById(addressid);
        address.status=false
        address.save()
        return({status:true})
      } catch (error) {}
    },
    placeOrder:async(body,userId,total)=>{
      console.log(body);
      console.log("kkkk");
      let addressId=body.address_id
      const cart = await Cart.findOne({ user: userId }).populate('products.productId')
      // const adrs = await addressModal.findOne({ user: userId })
      //   console.log(adrs);
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

  console.log("kka");
  console.log(adrs[0]);
  console.log(cart);
  console.log(total);  
  console.log(body.payment_method);
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

//    generateRazorpay:async(order,total)=>{
//     try {
//       console.log("yes");
//       console.log(order);
//       console.log(total);

//       // instance.orders.create({
//       //   amount: total,
//       //   currency: "INR",
//       //   receipt: "order",
//       //   notes: {
//       //     key1: "value3",
//       //     key2: "value2"
//       //   }
//       // }).then(response)
//       // console.log("ddd:",response);




// var options = {
//   amount: total,  // amount in the smallest currency unit
//   currency: "INR",
//   receipt:""+order
// };
// const order =await instance.orders.create(options) 
//   console.log(order);
//   console.log("bbb");
//   return order;

//     } catch (error) {
      
//     }
//    }


generaterazorpay:async(orderId,totalAmount)=>{
  console.log("888888888");
  console.log(orderId);
  console.log(totalAmount);
  try {
    console.log("hghg");
    // var instance = new Razorpay({ key_id: 'rzp_test_gFlxCSnUJ3aK5l', key_secret: 'nvm1ozXmKUEnyqNOjDJCMY80' })
    var options = {
      amount: totalAmount*100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: ""+orderId
    };
    console.log("adadad");
    const order = await instance.orders.create (options) 
      console.log(order);
      console.log("555555");
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


