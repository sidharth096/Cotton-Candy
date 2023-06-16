var express = require('express');
const admincontroller = require('../controller/admincontroller');
const adminhelper = require('../helpers/adminhelper');
var router = express.Router();
const {adminauthentication,admincheck}=require('../middleware/session')


/* GET users listing. */
router.get('/',adminauthentication,admincontroller.adminlogin) 
router.get('/adminpanel',admincheck,admincontroller.adminpanel,)
router.get('/forgotpassadmin',admincontroller.forgotpassAdmin)
router.get('/categories',admincheck,admincontroller.categories  )
router.get('/adminlogout',admincheck,admincontroller.adminlogout)
router.get('/userslist',admincheck,admincontroller.userslist)
router.get('/viewuser/:id',admincheck,admincontroller.viewuser)
router.get('/productlist',admincheck,admincontroller.productlist,)
router.get('/addproduct',admincheck,admincontroller.addproduct)
router.get('/deactiveproduct/:id',admincheck,admincontroller.deactiveproduct)
router.get('/activeproduct/:id',admincheck,admincontroller.activeproduct)
router.get('/editproduct/:id',admincheck,admincontroller.editproduct)
router.get('/orderlist',admincheck,admincontroller.orderlist)
router.get('/orderDetailadmin/:id',admincheck,admincontroller.orderDetailadmin)
router.get('/coupen',admincheck,admincontroller.coupen)
router.get('/offer',admincheck,admincontroller.offer)
router.get('/sales-report-page',admincheck,admincontroller.salesReportPage);
router.get('/logout',admincontroller.logout)




router.put('/blockuser/:id',admincheck,admincontroller.blockuser)
router.put('/unblockuser/:id',admincheck,admincontroller.unblockuser)
router.put('/deleteproduct/:id',admincheck,admincontroller.deleteproduct)
router.put('/deletecategory/:id',admincheck,admincontroller.deletecategory)
router.put('/deletecoupon/:id',admincheck,admincontroller.deleteCoupon)
router.put('/deleteOffer/:id',admincheck,admincontroller.deleteOffer)
router.put('/activeOffer/:id',admincheck,admincontroller.activeOffer)
router.put('/deactiveOffer/:id',admincheck,admincontroller.deactiveOffer)
router.put('/cancelOrder/:id',admincheck,admincontroller.cancelOrder)

router.put('/ReturnOrder/:id',admincheck,admincontroller.ReturnOrder) 

router.put('/orderDelivery/:id',admincheck,admincontroller.orderDelivery)


router.post('/checkotpforgotAdmin',admincontroller.checkotpForgot)
router.post('/verifyotpforgotAdmin',adminhelper.verifyOTPForgetAdmin )
router.post('/resetpasspost/:id',admincontroller.resetPassPostAdmin)
router.post('/adminlogin',admincontroller.adminpostlogin,)
router.post('/addproductpost',admincontroller.addproductpost)
router.post('/editproductpost/:id',admincontroller.editproductpost)
router.post('/add-coupen',admincheck,admincontroller.addCoupen)
router.post('/add-offer',admincheck,admincontroller.addOffer)
router.post('/getReport',admincheck,admincontroller.getReport)



module.exports = router;
