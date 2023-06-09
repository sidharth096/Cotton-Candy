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
const walletHelper = require('../helpers/wallethelper');

const wishlisthelper = require('../helpers/wishlisthelper');
const producthelper = require('../helpers/producthelper')
const orderhelper = require('../helpers/orderhelper');
const validatehelper = require('../helpers/validatehelper');
const couponhelper = require('../helpers/coupenhelper');
const ObjectId=require('mongoose').Types.ObjectId
const Razorpay = require('razorpay');


dotenv.config();


const key_id=process.env.key_id;
const key_secret=process.env.key_secret;
var instance = new Razorpay({
    key_id,
    key_secret 
  });


module.exports = {
    home: async (req, res) => {
        try {
            // if(req.session.user){
                let username= req.session.userid.name
                let userId= req.session.userid._id
                let products = await product.find({ productdeactive: { $eq: false } }).sort({ _id: -1 }) .limit(8); 
                wishlistcount = await wishlisthelper.getWishListCount(userId);
                cartCount = await userhelper.getCartCount(userId);
                res.render('shop/home.ejs',{username,products,wishlistcount,cartCount})
                
        } catch (err) {
            console.error(err)
        }
    },
    landingpage:async(req,res) =>{
        
        try{
          let products = await product.find({ productdeactive: { $eq: false } }).sort({ _id: -1 }) .limit(8); 
           res.render('shop/home.ejs',{products})
        }
        catch{
          res.render('error')
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
      return new Promise(async (resolve, reject)=> {
        try {
          user.findOne({ email: req.body.email }).then(async(oldUser, err) => {
            if (err) {
              reject(err);
              } else {
              if (oldUser) {
                let msg = "User already exist"
                res.render('shop/usersignup.ejs',{ msg })
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
                res.render('shop/verifyotp.ejs',{phonenumber} )
            }else{

                let msg=response.msg
                res.render('shop/otplogin.ejs',{msg})

               
            }
        })
    },
    checkotpForgot:(req,res)=>{
      
        userhelper.checkotpForgot(req.body).then((response) => {
            if(response.status){
                let phonenumber=response.validuser.phonenumber

                res.render('shop/verifyotpforgot.ejs',{phonenumber} )
            }else{

                let msg=response.msg
                res.render('shop/forgotpass.ejs',{msg})

               
            }
        })
    },
    contact: async(req, res) => {
      
        res.render("shop/contact.ejs");
    },


    shop: async (req, res) => {
      const count = parseInt(req.query.count) || 9;
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
        let walletBalance = await walletHelper.walletBalance(userId)
        walletBalance = currencyFormat(walletBalance);
        let  addresses=await addressModal.find({user:req.session.userid._id} )
        const Cart = await cart.findOne({ user: user}).populate('products.productId')
        let total=await userhelper.getCartTotal(user)
        let coupen=await couponModel.find()


        res.render("shop/checkout.ejs",{user,Cart,total,addresses,username,coupen,wishlistcount,cartCount,walletBalance});
    },
    productdetail:async(req,res)=>{
        if(req.session.user){ 
        var username= req.session.userid.name||null
        var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
       }
        let productid=req.params.id

        userhelper.productdetail(productid).then((response)=>{

            res.render("shop/productdetail.ejs",{response,username,wishlistcount,cartCount});
        })
      
    },
    resetPassPost:async(req,res)=>{
        try {
            let userid=req.params.id

            userhelper.resetpasspost(req.body,userid).then((response)=>{
                res.render('shop/userlogin.ejs')
            })
        } catch (error) {
            
        }

    },
    addToCart:async(req,res)=>{
        try {

            let userid=req.session.userid
             
     
            userhelper.addToCart(userid,req.body).then(async(response)=>{
            
                res.json(response)

            })
        } catch (error) {
            
        }
    },
  
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

    changeQuantity:async(req,res,next)=>{


        let userid=req.session.userid
     
       userhelper.changeProductQuantity(req.body).then(async(response)=>{
        await userhelper.getCartTotal(userid).then((total)=>{
           
            res.json({response:response,total:total})
         })
       
       })
       
       
      },
  addAddress:async(req,res)=>{

    let userId=req.session.userid._id

    userhelper.addAddress(req.body,userId).then((response)=>{
      res.status(202).json({response});
    })
  },
  deleteAddress:async(req,res)=>{
    try {

      let addressid = req.params.id;

      userhelper.deleteaddress(addressid).then(response => {
       res.json(response)
      });
      
    } catch (error) {
      
    }
  },

placeOrder : async (req, res) => {
    try {

      let userId=req.session.userid._id
  
        const cartItems = await cart
        .findOne({ user: userId })
        .populate("products.productId");

        if(!cartItems.products.length){
           return res.json({error:true,message:"Please add items to cart before checkout"})
        }

  
        if(req.body.address_id==undefined ){
            return res.json({ error:true, message: "Please Choose Address" })
        }

        if(req.body.payment_method==undefined ){
            return res.json({ error:true, message: "Please Choose Payment Method" })
        }

        let totalAmount=req.body.total
       
  
         let orderId=await orderHepler.orderPlacing(req.body, totalAmount,cartItems,userId)
                
                    await producthelper.decreaseStock(cartItems);

            
         if (req.body.payment_method== 'COD') {
          
            res.status(202).json({status:true, orderId:orderId})
        }
         else if (req.body.payment_method == 'wallet') {
          let isPaymentDone = await walletHelper.payUsingWallet(userId, totalAmount);
          if (isPaymentDone) {

             await orderModel.findOneAndUpdate(
              { _id: orderId },
              {
                $set: { 
                  orderStatus: "placed"
                }
              })
            

            res.status(202).json({status:true, orderId:orderId})
          }
           else {
              res.status(200).json({ payment_method: 'wallet', error: true, msg: "Insufficient Balance in wallet" })
          }
        }

        else{

            userhelper.generaterazorpay(orderId,totalAmount).then((response)=>{

                res.status(202).json({response, status:false});
            })
        }
  
  
    } catch (error) {
        console.log(error);
      }
  },
  
   
  
  orderSuccess: async (req, res) => {
    try {
      const orderid = req.query.id;

      let  userId = req.session.userid._id;
      if(req.session.user){ 
        var username= req.session.userid.name||null
      }
      
        const order = await  orderModel.findById(orderid)
        let orders=await orderhelper.getOrderedProductsDetails(orderid)

      
    
      let total=order.totalAmount

      await userhelper.clearCart(userId);   
      
      var wishlistcount = await wishlisthelper.getWishListCount(userId);
      var cartCount = await userhelper.getCartCount(userId);
       res.render("shop/orderSuccess.ejs",{orders,total,wishlistcount,cartCount,username});
      
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

      res.render('shop/orderlist.ejs',{orders,username,wishlistcount,cartCount})
      
    } catch (error) {
      
    }
  },


orderdetailsOfuser: async (req, res) => {
  try {
    console.log("sidhart");    let orderid = req.params.id;
    if (req.session.user) {
      var username = req.session.userid.name || null;
      var userId= req.session.userid._id
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
    }

    
    let orderaddress = await orderHepler.getOrderedUserDetailsAndAddress(orderid);
    console.log("aaa");
    console.log(orderaddress);
    let address=await addressModal.find({user:req.session.userid._id})
    let orderdetailes = await orderHepler.getOrderedProductsDetails(orderid);
 
    res.render("shop/orderdetails-user", {
      orderdetailes,
      address,
      orderid,
      username,
      wishlistcount,
      cartCount,
      orderaddress
    });
  } catch (error) {}
  },


  
 
  
  
verifypayment: async (req, res) => {
    try {

      try {
        let details = req.body;

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


          res.json({ status: false, errMsg: "" });
        }
      } catch (error) {

        res.status(500).send("Internal server error");
      }
    } catch (error) {}
  },
userProfile:async(req,res)=>{
    try {
      var userId= req.session.userid._id
      if(req.session.user){ 
        var username= req.session.userid.name||null
            var wishlistcount = await wishlisthelper.getWishListCount(userId);
            var cartCount = await userhelper.getCartCount(userId);
       }
        let user=req.session.userid
        let address=await addressModal.find({user:req.session.userid._id})
        const orders = await orderhelper.getAllOrderDetailsOfAUser(userId)
        let walletBalance=await walletHelper.walletBalance(userId)
        res.render('shop/user-profile',{orders,username,address,user,wishlistcount,cartCount,walletBalance})
    } catch (error) {
        
    }
},
cancelOrder:async(req,res)=>{ 
    try {
      let orderId=req.params.id

      const order = await orderModel.findOne({ _id: req.params.id });

      const canceledItems = order.orderedItems;

      for (const item of canceledItems) {
       const Product = await product.findOne({ _id: item.productId });
        Product.productquantity += item.quantity;
        await Product.save();
      }

    //  const cancelledResponse= await orderModel.findOneAndUpdate(
    //     { _id: orderId },
    //     {
    //       $set: { 
    //         orderStatus: "Cancelled"
    //       }
    //     }) 

    //     if(cancelledResponse.paymentMethod!='COD'){
    //       await walletHelper.addMoneyToWallet(userId,cancelledResponse.totalAmount);
    //     }
    const cancelledResponse = await orderModel.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          orderStatus: "Cancelled"
        }
      }
    );
    let userId =cancelledResponse.user
       console.log(userId);
    console.log(cancelledResponse);
    if (cancelledResponse.paymentMethod != "COD") {
      await walletHelper.addMoneyToWallet(
        userId,
        cancelledResponse.totalAmount
      );
    }
        res.json({status:true})
      

         
    } catch (error) {
        
    }
 },
 ReturnOrder:async(req,res)=>{
    try {
        let orderId=req.params.id

        const order = await orderModel.findOne({ _id: req.params.id });

        const canceledItems = order.orderedItems;
  
        for (const item of canceledItems) {
         const Product = await product.findOne({ _id: item.productId });
          Product.productquantity += item.quantity;
          await Product.save();
        }


        // const returnResponse= await orderModel.findOneAndUpdate(
        //   { _id: orderId },
        //   {
        //     $set: {
        //       orderStatus: "Return"
        //     }
        //   })

        //   if(returnResponse.paymentMethod!='COD'){
        //     await walletHelper.addMoneyToWallet(userId,returnResponse.totalAmount);
        //   }
        const returnResponse = await orderModel.findOneAndUpdate(
          { _id: orderId },
          {
            $set: {
              orderStatus: "Return"
            }
          }
         );
         let userId=returnResponse.user
  
          await walletHelper.addMoneyToWallet(userId, returnResponse.totalAmount);

          res.json({status:true})
      
  
           
      } catch (error) {
          
      }
 },


productSearch: async (req, res) => {
  try {
    const searchQuery = req.body.query;

    const searchResults = await product.find({ productname: { $regex:new RegExp('^' + searchQuery, 'i') }}).lean();
    res.json(searchResults);
  } catch (error) {
    console.error('Error occurred while performing the search:', error);
    res.status(500).send('Failed to perform the search');
  }
},


searchUser: async (req, res) => {
  try {

    const query = req.query.query;
    const products = await product.find({ productname: { $regex: query, $options: 'i' } }).lean();
    res.redirect('/shop?array=' + encodeURIComponent(JSON.stringify(products)));
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }

},
 applyCoupon :async (req, res) => {
  try {
      if(req.body.totalAmount <500){
        res.json({ status: false, message: "Coupon available only for the 500₹ abouve purchase" })
      }
      const user = req.session.userid
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
  },

productFiltering: async (req, res) => {
  try {

    let categories = req.body["categories[]"];
    let pricerange = req.body["priceRanges[]"];
    let colour = req.body["colors[]"];
    let size = req.body.size;

    // Build the filter object based on the provided data
    const filter = {};
    filter.productdeactive=false
    
    if (categories && categories !== "") {
      filter.productcategory = categories;
    }

    if (pricerange && pricerange !== "") {
      let [minPrice, maxPrice] = pricerange.split("-");
      filter.productpromotionalprice = {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice)
      };
    }

    if (colour && colour !== "") {
      filter.productcolour = colour;
    }

    if (size && size !== "") {
      filter.productsize = size;
    }
    

    const filteredProducts = await product.find(filter);
   
    res.json(filteredProducts);
  } catch (error) {
    // Handle any errors that occur during filtering
    console.error(error);
    res.status(500).json({ error: "An error occurred while filtering products." });
  }
}

}

// convert a number to a indian currency format
function currencyFormat(amount) {
  return Number(amount).toLocaleString("en-in", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  });
}

