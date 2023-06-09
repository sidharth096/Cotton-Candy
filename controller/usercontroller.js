const { response } = require('express')
const userhelper = require('../helpers/userhelper')
const dotenv = require("dotenv");
const product = require ("../models/productmodel");
const category = require('../models/categorymodel');
const cart=require('../models/cartmodel')
const addressModal = require('../models/addressmodel')
const orderModel = require('../models/ordermodels')
const user = require('../models/usermodel')
const couponModel = require('../models/coupenmodel')
const orderHepler = require('../helpers/orderhelper');
const wishlisthelper = require('../helpers/wishlisthelper');
const producthelper = require('../helpers/producthelper')
const orderhelper = require('../helpers/orderhelper');
const validatehelper = require('../helpers/validatehelper');
const couponhelper = require('../helpers/coupenhelper');
const ObjectId=require('mongoose').Types.ObjectId
const Razorpay = require('razorpay');


dotenv.config();

var instance = new Razorpay({
    key_id: 'rzp_test_kk1KzL6j3Vt8x4',
    key_secret: 'KOSqPmO7KQ70pBJpFCJKMYwB',
  });


module.exports = {
    home: async (req, res) => {
        try {
            // if(req.session.user){
                let username= req.session.userid.name
                let userId= req.session.userid._id
                let products = await product.find({ productdeactive: { $eq: false } })
                wishlistcount = await wishlisthelper.getWishListCount(userId);
                cartCount = await userhelper.getCartCount(userId);
                console.log("aaa");
                console.log(wishlistcount);
                console.log(cartCount);
                res.render('shop/home.ejs',{username,products,wishlistcount,cartCount})
                
            // }
            // else{
            //     res.render('shop/home.ejs')
            // }
        } catch (err) {
            console.error(err)
        }
    },
    landingpage:async(req,res) =>{
        
        try{
          let products = await product.find({ productdeactive: { $eq: false } })
            res.render('shop/home.ejs',{products})
        }
        catch{
            console.error(err)
        }
    },
    userlogin: async (req, res) => {
        try {
            res.render('shop/userlogin.ejs')
               
            }   
         catch (err) {
            console.error(err)
        }
    },
    usersignup: async (req, res) => {
        try {
           
            res.render('shop/usersignup.ejs')
        } catch (err) {
            console.error(err)
        }
    },
    signuppost: async (req, res) => {
      console.log("1");
      return new Promise(async (resolve, reject)=> {
        try {
          user.findOne({ email: req.body.email }).then(async(oldUser, err) => {
            if (err) {
              reject(err);
              } else {
                console.log("3");
                console.log(oldUser);
              if (oldUser) {
                let msg = "User already exist"
                res.render('shop/usersignup.ejs',{ msg })
              }
              else {
                console.log("4");
                console.log(req.body.mobile);
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
        // userhelper.dosignup(req.body).then((response) => {
         
        //     if (response.status) {
        //         let msg = "User already exist"
        //         res.render('shop/usersignup.ejs',{ msg })
        //     } else {
        //         req.session.user=true
        //         req.session.userid=response.user
        //         console.log("aaaa");
        //         res.redirect('/')
        //     }
        // })

    },
    // loginpost:async(req,res)=>{
    //     userhelper.dologin(req.body).then((response)=>{
    //         const user=response.user
    //         if(response.status){
    //             let msg="User already exist"
    //             res.render('shop/usersignup.ejs',{msg})
    //         }else{
    //             res.render('shop/home.ejs')
    //         }
    //     })

    // },
    loginpost: (req, res) => {
        userhelper.dologin(req.body).then((response) => {


            if (response.status) { 
                 if(response.user.block==true){
                    let msg="User is blocked"
                     res.render('shop/userlogin.ejs',{msg})
                 }else{
                    req.session.user=true
                    req.session.userid= response.user
                    res.redirect('/')
                 }
               
            } else {
                let msg=response.msg
                res.render("shop/userlogin.ejs",{msg});
            }
            //   } else {
            //     var blockmsg = "Account is blocked...Unable to login";
            //     res.render("shop/userlogin/login.ejs", { blockmsg: blockmsg });
            //   }

        });
    },
    logout: (req, res) => {
        req.session.user = false;
      
        
        res.redirect("/");
    },
    otplogin:(req,res)=>{
        res.render("shop/otplogin.ejs")
    },
    checkotp:(req,res)=>{
      
        userhelper.checkotp(req.body).then((response) => {
            if(response.status){
                let phonenumber=response.validuser.phonenumber
                console.log(response.msg);
                res.render('shop/verifyotp.ejs',{phonenumber} )
            }else{
                console.log(response.msg);
                let msg=response.msg
                res.render('shop/otplogin.ejs',{msg})

               
            }
        })
    },
    checkotpForgot:(req,res)=>{
      
        userhelper.checkotpForgot(req.body).then((response) => {
            if(response.status){
                let phonenumber=response.validuser.phonenumber
                console.log(response.msg);
                res.render('shop/verifyotpforgot.ejs',{phonenumber} )
            }else{
                console.log(response.msg);
                let msg=response.msg
                res.render('shop/forgotpass.ejs',{msg})

               
            }
        })
    },
    contact: async(req, res) => {
      
        res.render("shop/contact.ejs");
    },

    // shop: async(req, res) => {
    // //    let products= req.query.value; 
    //    const products = JSON.parse(req.query.array);
    //    console.log("jhsdjhsd");
    //    console.log(products);
    //    console.log("=========");
    //    if(products){
    //      let categories=await category.find()
    //      res.render("shop/shop.ejs",{products,categories});
    //    }
    //    else{
    //     let products= await product.find({
    //         productdeactive:{$eq:false}
    //        })
    //        let categories=await category.find()
    //        res.render("shop/shop.ejs",{products,categories});
    //    }
     
    // },
    shop: async (req, res) => {
      const count = parseInt(req.query.count) || 4;
      const page = parseInt(req.query.page) || 1;
      const totalCount = await  product.countDocuments();
      const startIndex = (page - 1) * count;
      const totalPages = Math.ceil(totalCount / count);

      // Generate a random offset based on the total count and the page size
      const randomOffset = Math.floor(Math.random() * (totalCount - count));
      const endIndex = Math.min(count, totalCount - startIndex);
      const pagination = {
        totalCount: totalCount, // change this to `totalCount` instead of `totalProductsCount`
        totalPages: totalPages,
        page: page,
        count: count,
        startIndex: startIndex,
        endIndex: endIndex, 
      };
        const products = req.query.array ? JSON.parse(req.query.array) : null;
        console.log(products);
        if(req.session.user){ 
            var username= req.session.userid.name||null
            var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
        }
        
        if (products) { 
          let categories = await category.find();
          res.render("shop/shop.ejs", { products, categories,username,pagination });
        } else {

        let products = await product.find({ productdeactive: { $eq: false } }).skip( startIndex)
        .limit(count)
        .lean();
          let categories = await category.find();
       
          res.render("shop/shop.ejs", { products, categories,username,pagination,wishlistcount,cartCount});
        }
      },
      
    


    about: async(req, res) => {
      if(req.session.user){ 
        var username= req.session.userid.name||null
    }
        res.render("shop/about.ejs",{username});
    },
    forgotpass: async(req, res) => {
        res.render("shop/forgotpass.ejs");
    },
    shoppingcart:async(req,res)=>{
        try {
           if(req.session.user){ 
            var username= req.session.userid.name||null
            var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
           }
            let product;
            const user = req.session.userid;
             const Cart = await cart.findOne({user:user}).populate(     
                 "products.productId"
              );
              if(Cart){
               product=Cart.products
              }
                let total=await userhelper.getCartTotal(user)
             

            res.render("shop/shoppingcart.ejs",{user,product,Cart,total,username,wishlistcount,cartCount});
        } catch (error) {
            
        }

        
    },


    checkout:async(req,res)=>{
        if(req.session.user){ 
         var username= req.session.userid.name||null
         var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
        }
        let cartId=req.params.id
        let user=req.session.userid
        let  addresses=await addressModal.find({user:req.session.userid._id} )
        const Cart = await cart.findOne({ user: user}).populate('products.productId')
        let total=await userhelper.getCartTotal(user)
        let coupen=await couponModel.find()
        console.log("ahhaahahahh");
        console.log(coupen);
        console.log(total);
        console.log(Cart);
        console.log(user);

        // const address = await addressModal.findOne({ user: user._id}).populate(
        //     "address._id"
        //   );
        //   const addresses = address ? address.address : [];



        res.render("shop/checkout.ejs",{user,Cart,total,addresses,username,coupen,wishlistcount,cartCount});
    },
    productdetail:async(req,res)=>{
        if(req.session.user){ 
        var username= req.session.userid.name||null
        var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
       }
        let productid=req.params.id
        console.log("hai"); 
        console.log(productid);
        userhelper.productdetail(productid).then((response)=>{
            console.log("======================================");
            console.log(response);
            console.log("sdff");
            res.render("shop/productdetail.ejs",{response,username,wishlistcount,cartCount});
        })
      
    },
    resetPassPost:async(req,res)=>{
        try {
            console.log("======================b=============");
            let userid=req.params.id
            console.log(userid);
            userhelper.resetpasspost(req.body,userid).then((response)=>{
                res.render('shop/userlogin.ejs')
            })
        } catch (error) {
            
        }
    },
    addToCart:async(req,res)=>{
        try {
            console.log("aaaaa");
            let userid=req.session.userid
            console.log(userid);
              
     
            userhelper.addToCart(userid,req.body).then(async(response)=>{
            
                res.json(response)

            })
        } catch (error) {
            
        }
    },
    // deleteCartItem:async(req,res)=>{
    //     try {
    //         let user=req.session.uerid
    //         let productid=req.params.id
    //         userhelper.deleteProductFromCart(user,productid).then((response)=>{
               
    //             res.redirect('/shoppingcart')
    //         })
            
    //     } catch (error) {
            
    //     }
    // },
    // removeCartItem: async (req, res) => {
    //     let  productId = req.params.id
    //     console.log(productId);
    //     let userId = req.session.userid
    //     try{
    //       const response = await userhelper.removeCartItem(userId, productId);
    //       if(response.status){
    //         res.redirect('/shoppingcart')
    //         res.json({success:true,message:response.message})
    //       }else{
    //         res.json({success:false,message:response.message})
    //       }
        
    //     }catch(error){
    //       console.log(error);
    //      }
    //   
    //     },
    removecartitem: async (req, res) => {
      let productId = req.params.id;
      console.log(productId);
      let userId = req.session.userid;
      try {
        const response = await userhelper.removeCartitem(userId, productId);
        if (response.status) {
          res.redirect("/shop-cart");
          res.json({ success: true, message: response.message });
        } else {
          res.json({ success: false, message: response.message });
        }
      } catch (error) {
        console.log(error);
      }
    },
    // changeproductquantity:async(req,res,next)=>{
       
         
    //     userhelper.changeproductquantity(req.body).then((response)=>{
    //         res.json(response)
    //     })
    // }
    changeQuantity:async(req,res,next)=>{
        console.log(req.body);
        console.log("fff");
        let userid=req.session.userid
     
       userhelper.changeProductQuantity(req.body).then(async(response)=>{
        await userhelper.getCartTotal(userid).then((total)=>{
           
            res.json({response:response,total:total})
         })
       
       })
       
       
      },
  addAddress:async(req,res)=>{
    console.log("xkfksdk");
    console.log(req.body);
    let userId=req.session.userid._id
    console.log("================================");
    console.log(userId);
    console.log("================================");
    userhelper.addAddress(req.body,userId).then((response)=>{
      res.status(202).json({response});
    })
  },
  deleteAddress:async(req,res)=>{
    try {
      console.log("lllllllllll");
      let addressid = req.params.id;
      console.log(addressid);
      userhelper.deleteaddress(addressid).then(response => {
       res.json(response)
      });
      
    } catch (error) {
      
    }
  },
//   placeOrder:async(req,res)=>{
//     try {
//         let userId=req.session.userid._id
//         let total=await userhelper.getCartTotal(userId)
//         userhelper. placeOrder(req.body,userId,total).then(response=>{
//             console.log(response);
//             res.json(response)
//         })
//     } catch (error) {
        
//     }
placeOrder : async (req, res) => {
    try {
      console.log("/////////");
      console.log(req.body);
      let userId=req.session.userid._id
      console.log(req.body.address_id);
      console.log(req.body.payment_method);
      console.log(req.body.total);
  
        const cartItems = await cart
        .findOne({ user: userId })
        .populate("products.productId");
        // let coupon=await couponSchema.find({user:userId})
       console.log("bbbbbbb");
       console.log(cartItems);
        if(!cartItems.products.length){
           return res.json({error:true,message:"Please add items to cart before checkout"})
        }
        console.log("999");
  
        if(req.body.address_id==undefined ){
            return res.json({ error:true, message: "Please Choose Address" })
        }
        console.log("909");
        if(req.body.payment_method==undefined ){
            return res.json({ error:true, message: "Please Choose Payment Method" })
        }
        console.log("9k9");
        
        // const totalAmount = await cartHelper.totalAmount(userId); // instead find cart using user id and take total amound from that 
        let totalAmount=req.body.total
        console.log(totalAmount,"totalAmount");
        
        console.log(userId,"userId");
        console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
  
        console.log(cartItems);
        console.log("zzzzzzzzzzzz");
        console.log(cartItems.products.productId);
        console.log("zzzzzzzzzzzz");
        console.log(req.body);
        console.log(userId);
        console.log(req.body.payment_method);
        console.log(req.body.address_id);
        console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
       
  
         let orderId=await orderHepler.orderPlacing(req.body, totalAmount,cartItems,userId)
                
                    console.log("thanabana");
                    console.log(orderId);
                    // await productHelper.decreaseStock(cartItems);
                    // await cartHelper.clearCart(userId);
                    // cartCount = await cartHelper.getCartCount(userId)
                    
            
         if (req.body.payment_method== 'COD') {
          await producthelper.decreaseStock(cartItems);
            res.status(202).json({status:true, orderId:orderId})
        }
        else{
            console.log("nmnmnm");
            userhelper.generaterazorpay(orderId,totalAmount).then((response)=>{
               console.log("lll",response)
                res.status(202).json({response, status:false});
            })
        }
  
  
    } catch (error) {
        console.log(error);
      }
  },
  
   
  
  orderSuccess: async (req, res) => {
    try {
      const user = req.session.userid;
      const orderid = req.query.id;
      console.log(orderid);
      const userId = req.session.userid._id;
      if(req.session.user){ 
        var username= req.session.userid.name||null
      }
     
        const order = await  orderModel.findById(orderid)
        let orders=await orderhelper.getOrderedProductsDetails(orderid)
       
       console.log("ddd");
      console.log(order);
      console.log("ppp");
      console.log("ffp");
      console.log(orders);
      
      // console.log(Cart);
      // if(Cart){
      //   product = Cart.products
      // }
      // console.log("ttttttt");
      // console.log(product);
      let total=order.totalAmount
     
      console.log(total);
      await userhelper.clearCart(userId);   
      // var userId= req.session.userid._id
      var wishlistcount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
        res.render("shop/ordersuccess.ejs",{orders,total,wishlistcount,cartCount,username});
    } catch (error) {}
  },
orderList:async(req,res)=>{
    try {
      var  userId=req.session.userid._id;
      if(req.session.user){ 
        var username= req.session.userid.name||null
        // var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
      }
     
      const orders = await orderhelper.getAllOrderDetailsOfAUser(userId)
      
      console.log("aaaaaaaa");
      console.log(orders);
      res.render('shop/orderlist.ejs',{orders,username,wishlistcount,cartCount})
      
    } catch (error) {
      
    }
  },


//  orderdetailsOfuser:async(req,res)=>{
//     try {
//        let orderid=req.params.id 
//        console.log("asasasasas");
//        console.log(orderid);
//        let useraddress= await orderhelper.getOrderedUserDetailsAndAddress(orderid)
//        let orderdetailes=await orderhelper.getOrderedProductsDetails(orderid)
//        console.log("alakaalakaka");
//        console.log(orderdetailes);
//        console.log("ssssssssssss");
//        console.log(product);

//        res.render('shop/orderdeatils-user',{orderdetailes,orderid})
//     } catch (error) {
        
//     }

// },
orderdetailsOfuser: async (req, res) => {
  try {
    console.log("sidhart");
    let orderid = req.params.id;
    if (req.session.user) {
      var username = req.session.userid.name || null;
      var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
    }
    console.log("aaa");
    console.log(username)
    
    // let orderaddress = await orderHepler.getOrderedUserDetailsAndAddress(orderid);
    let address=await addressModal.find({user:req.session.userid._id})
    let orderdetailes = await orderHepler.getOrderedProductsDetails(orderid);
    console.log(address);
    console.log("lllll");
   
    console.log("5555555555444444");
    console.log(orderdetailes);
    res.render("shop/orderdeatils-user", {
      orderdetailes,
      address,
      orderid,
      username,
      wishlistcount,
      cartCount
    });
  } catch (error) {}
  },


  
 
  
  
verifypayment: async (req, res) => {
    try {

      try {
        let details = req.body;
        console.log(req.body);
        // console.log(req.body,'hello this is my body')
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", "KOSqPmO7KQ70pBJpFCJKMYwB");
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        let orderResponse = details["order[response][receipt]"];
      
        let orderObjId = new ObjectId(orderResponse);
   
        if (hmac === details["payment[razorpay_signature]"]) {
          
          await orderModel.updateOne(
            { _id: orderObjId },
            {
              $set: {
                orderStatus: "placed"
              }
            }
          );

          console.log("Payment is successful");
          res.json({ status: true ,orderId:orderObjId});
        } else {
          await orderModel.updateOne(
            { _id: orderObjId },
            {
              $set: {
                orderStatus: "failed"
              }
            }
          );

          console.log("Payment is failed");
          res.json({ status: false, errMsg: "" });
        }
      } catch (error) {
        console.log(error, "error");
        res.status(500).send("Internal server error");
      }
    } catch (error) {}
  },
userProfile:async(req,res)=>{
    try {
      console.log("aa");
      var userId= req.session.userid._id
      if(req.session.user){ 
        var username= req.session.userid.name||null
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
       }
        let user=req.session.userid
        console.log(user)
        // let userId=req.session.userid._id
        console.log(userId);
        let address=await addressModal.find({user:req.session.userid._id})
        const orders = await orderhelper.getAllOrderDetailsOfAUser(userId)
        console.log("vbvbvb");
        console.log(orders);
        res.render('shop/user-profile',{orders,username,address,user,wishlistcount,cartCount})
    } catch (error) {
        
    }
},
cancelOrder:async(req,res)=>{ 
    try {
      let orderId=req.params.id
      console.log("anamaamana");
      console.log(orderId);
      await orderModel.updateOne(
        { _id: orderId },
        {
          $set: {
            orderStatus: "Cancelled"
          }
        })
        res.json({status:true})
    

         
    } catch (error) {
        
    }
 },
 ReturnOrder:async(req,res)=>{
    try {
        let orderId=req.params.id
        console.log("anamaamana");
        console.log(orderId);
        await orderModel.updateOne(
          { _id: orderId },
          {
            $set: {
              orderStatus: "Return"
            }
          })
          res.json({status:true})
      
  
           
      } catch (error) {
          
      }
 },
 search: async (req, res) => {
  try {

    
    const query = req.query.query;
    console.log(query);
    // Perform the search query using the provided search term
    const products = await product.find({ productname: { $regex: query, $options: 'i' } }).lean();
    console.log("fff");
    console.log(products);
    res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

},
searchUser: async (req, res) => {
  try {

    const query = req.query.query;
    console.log(query);
    // Perform the search query using the provided search term
    const products = await product.find({ productname: { $regex: query, $options: 'i' } }).lean();
    console.log("fff");
    console.log(products);
    res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

},
 applyCoupon :async (req, res) => {
  try {
      const user = req.session.userid
      console.log(user);
      const { totalAmount, couponCode } = req.body;

      const response = await couponhelper.applyCoupon(user._id, couponCode,totalAmount);

      res.json(response);

  } catch (error) {

  }
},
wishlist : async (req, res) => {

  try {
      let userId = req.session.userid._id;

      if(req.session.user){ 
        var username= req.session.userid.name||null
      }
      let Wishlist = await wishlisthelper.getAllWishListItems(userId);

      // var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
      res.render('shop/wishlist.ejs', {Wishlist,wishlistcount,cartCount,username})
 
  } catch (error) {
      res.redirect('404')
  }
},
 addToWishList : async (req, res) => {
  try {
 
      let productId = req.body.productId;
      if(req.session.user){
      var  user = req.session.userid._id;
      }


      let response = await wishlisthelper.addItemToWishList(productId, user)

      res.json(response)
  } catch (error) {
      console.log(error);
  }
},
removeFromWishList: async (req, res) => {

    try {
      let userId = req.session.userid._id;
      if (req.session.user) {
        var username = req.session.userid.username || null;
      }
      let productId = req.params.id;

      await wishlisthelper.removeAnItemFromWishList(userId, productId);
      wishListCount = await wishlisthelper.getWishListCount(userId);

      // res.status(200).json({message:"product removed from wishList",wishListCount})
      if (response.status) {
      
        res.json({ success: true, message: response.message });
      } else {
        res.json({ success: false, message: response.message });
      }
    } catch (error) {}
  }



   




}