    var express = require('express');
    var router = express.Router();
    const usercontroller=require('../controller/usercontroller')
    const userhelper=require('../helpers/userhelper')
    const validatehelper=require('../helpers/validatehelper')
    const {userauthentication,authentication}=require('../middleware/session')

    /* GET home page. */
    router.get('/',userauthentication, usercontroller.landingpage) 
    router.get('/home',authentication,usercontroller.home)
    router.get('/login',userauthentication, usercontroller.userlogin) 
    router.get('/signup',usercontroller.usersignup)
    router.get('/logout',usercontroller.logout)
    router.get('/otplogin',usercontroller.otplogin)
    router.get('/contact',usercontroller.contact)
    router.get('/shop',usercontroller.shop)
    router.get('/about',usercontroller.about)
    router.get('/forgotpass',usercontroller.forgotpass)
    router.get('/shoppingcart',authentication,usercontroller.shoppingcart)
    router.get('/checkout',authentication,usercontroller.checkout)
    router.get('/productdetail/:id',usercontroller.productdetail)
    router.get('/userProfile',authentication,usercontroller.userProfile)

    router.get('/orderSuccess',authentication,usercontroller.orderSuccess)
    router.get('/orderList',authentication,usercontroller.orderList)
    router.get('/orderdetailsOf-user/:id',authentication,usercontroller.orderdetailsOfuser)
    router.put('/cancelOrder/:id',authentication,usercontroller.cancelOrder)
    router.get('/searchUser',usercontroller.searchUser)
    router.put('/ReturnOrder/:id',authentication, usercontroller.ReturnOrder)
    router.get('/wishlist',authentication,usercontroller.wishlist);
    router.put('/deleteAddress/:id',authentication,usercontroller.deleteAddress)
    router.put('/removecartitem/:id',usercontroller.removecartitem)

    

    router.post('/productSearch',usercontroller.productSearch)
    router.post('/signup',usercontroller.signuppost )
    router.post('/login',usercontroller.loginpost )
    router.post('/checkotp',usercontroller.checkotp )
    router.post('/checkotpforgot',usercontroller.checkotpForgot )
    router.post('/verifyotp',userhelper.verifyOTP )
    router.post('/verifyotpforgot',userhelper.verifyOTPForget )
    router.post('/verifyotpSignup',validatehelper.verifyOTPSignup )
    router.post('/resetpasspost/:id',usercontroller.resetPassPost)
    router.post('/changeQuantity',authentication,usercontroller.changeQuantity)
    router.post('/addAddress',authentication,usercontroller.addAddress)
    router.post('/placeOrder',authentication,usercontroller.placeOrder)
    router.post('/addToCart',authentication,usercontroller.addToCart)
    router.post('/verify-payment',authentication,usercontroller.verifypayment)
    router.post('/apply-coupon',authentication,usercontroller.applyCoupon)
    router.post('/add-to-wishList',authentication,usercontroller.addToWishList);
    router.post('/productFiltering',usercontroller.productFiltering);
    router.put('/remove-from-wishList/:id',authentication,usercontroller.removeFromWishList);
    
     
   
    module.exports = router;
 