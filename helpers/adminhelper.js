const mongoose = require("mongoose");
const user = require("../models/usermodel")
const Category = require("../models/categorymodel")
const product = require("../models/productmodel")
const orderModel = require('../models/ordermodels')
const Coupon = require('../models/coupenmodel')
const Offer = require('../models/offermodel')
const admin = require("../models/adminmodel")
const twilioFunctions = require('../config/twilio')
const voucherCode = require("voucher-code-generator")
const bcrypt = require('bcrypt')

const dotenv = require("dotenv");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken)

dotenv.config();
module.exports = {


  getDashboardDetails:async () => {
    return new Promise(async (resolve, reject) => {
        let response = {}
        let totalRevenue, monthlyRevenue, totalProducts;

        totalRevenue = await orderModel.aggregate([
            {
                $match: { orderStatus: 'delivered' }  
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ])
        response.totalRevenue = totalRevenue[0].revenue;

        monthlyRevenue = await orderModel.aggregate([
            {
                $match: {
                    orderStatus: 'delivered',
                    orderDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: '$totalAmount' }
                }
            }
        ])
        response.monthlyRevenue = monthlyRevenue[0]?.revenue

        totalProducts = await product.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$productquantity" }
                }
            }
        ])
        response.totalProducts = totalProducts[0]?.total;

        response.totalOrders = await orderModel.find({ orderStatus: 'delivered' }).count();

        response.numberOfCategories = await Category.find({}).count();

        resolve(response)
    })
},

checkotpForgot: function (body) {

  return new Promise((resolve, reject) => {
    try {
      admin.findOne({ phonenumber: body.phonenumber }).then((validuser, err) => {

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

            let msg = "Incorrect number"
            resolve({ status: false, msg });
          }

        }
      })
    }
    catch {

    }
  })
},
verifyOTPForgetAdmin: async (req, res) => {
  const otp = req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;
  const phonenumber = req.body.phone;

  try {
    client.verify.v2.services(`VA8b01b7f5e6f1671b4ddf2e23e407544e`).verificationChecks.create({
      to: `+91${phonenumber}`,
      code: otp
    }).then(async (verificationChecks) => {
      if (verificationChecks.status === "approved") {
        let Admin = await admin.findOne({ phonenumber: phonenumber });
        res.render('admin/changepasswordAdmin.ejs',{Admin})
      }
      else {
        let msg = "Incorrect OTP"
        res.render('admin/verifyotpforgotAdmin.ejs', { msg, phonenumber })
      }

    });
  } catch (error) {
    console.error(error);
    res.render("catchError", {
      message: error.message,
    });
  }
},
resetpasspostAdmin: async (body, adminId) => {
  try {

    var saltRounds = 10;
    var password = body.password.toString();
    bcrypt.hash(password, saltRounds, async function (err, newpassword) {
      if (err) {
        reject(err);
      } else {

        let admindata = await admin.findById(adminId);
        admindata.password = newpassword; // Set the new password on the user object
        await admindata.save(); // Save the updated user object to the database

      }
    });
  } catch (error) {
    // Handle errors here
  }
},

 

  addCategories: async (category) => {
    try {
      console.log("fkjgkdfjkjl");
      console.log(category);
      console.log(category.category);

      const existingCategory = await Category.findOne({
        categoryname: { $regex: new RegExp(`^${category.category}$`, 'i') }
      });

  
      if (existingCategory) {
        return { status: false };
      }
  
      const newCategory = new Category({
        categoryname: category.category,
      });
      await newCategory.save();
      return { status: true };
    } catch (error) {
      console.error('Error adding category:', error);
      return { status: false};
    }
  },
  
  



  addproduct: async (body, file) => {
    try {


      const newproduct = new product({
        productname: body.productname,
        productsize: body.size,
        productpromotionalprice: body.promotionalprice,
        productregularprice: body.regularprice,
        productdescription: body.description,
        productquantity: body.quantity,
        productcategory: body.category,
        productcolour:body.colour,
        productimage: file.map((file) => file.filename)
      });
      await newproduct.save();
    

    } catch (error) {
      console.error("Error addingproduct:", error);
    }
  },
   editproduct: async (body, file, productid) => {

    
    if (file.length==0) {

      await product.findByIdAndUpdate({ _id: productid },
        {
          $set:
          {
            productname: body.productname,
            productsize: body.size,
            productpromotionalprice: body.promotionalprice,
            productregularprice: body.regularprice,
            productdescription: body.description,
            productquantity: body.quantity,
            productcategory: body.category,
            productcolour:body.colour
            
          }
        })
    }
    else {

      await product.findByIdAndUpdate({ _id: productid },
        {
          $set:
          {
            productname: body.productname,
            productsize: body.size,
            productpromotionalprice: body.promotionalprice,
            productregularprice: body.regularprice,
            productdescription: body.description,
            productquantity: body.quantity,
            productcategory: body.category,
            productcolour:body.colour,
            productimage: file.map((file) => file.filename)
          }
        })
    }

  },


  blockuser: async (body) => {

    let userid = body
    let userdetail = await user.findById(userid)
    userdetail.block = true
    await userdetail.save()

  },
  unblockuser: async (body) => {
    let userid = body
    let userdetail = await user.findById(userid)
    userdetail.block = false
    await userdetail.save()

  },


  //Delete
  

  deleteproduct: async (body) => {
    try {
      let productid = body
      await product.findByIdAndDelete(productid,);
      return({status:true})
     } 
     catch (error) {
      
     }
  },
  
  deletecategory: async (body) => {
    try {
      let categoryid = body;
      let categorydetails = await Category.findById(categoryid);
      console.log(categorydetails);
      let categoryname = categorydetails.categoryname;
  
      await product.deleteMany({ productcategory: categoryname });
      await Category.findByIdAndDelete(categoryid);

    } catch (error) {
      console.error("Error deleting category:", error);
    }
  },

  deleteCoupon: async (body) => {
    try {
      let couponId = body
      await Coupon.findByIdAndDelete(couponId,);
      return({status:true})
    } 
    catch (error) {
      
    }
  },

  deleteOffer: async (body) => {
    try {
      let offerId = body
      await Offer.findByIdAndDelete(offerId,);
      return({status:true})
    } 
    catch (error) {
      
    }
    

  },
  
  deactiveproduct: async (body) => {
    console.log("hii");
    let productid = body
    let productdetail = await product.findById(productid)
    productdetail.productdeactive = true
    await productdetail.save()
    console.log(productdetail);
  },
  activeproduct: async (body) => {
    let productid = body
    let productdetail = await product.findById(productid)
    productdetail.productdeactive = false
    await productdetail.save()
    console.log(productdetail);
  },
  getChartDetails:async () => {
    return new Promise(async (resolve, reject) => {
        const orders = await orderModel.aggregate([
            {
                $match: { orderStatus: 'delivered' }
            },
            {
                $project: {
                    _id: 0,
                    orderDate: "$createdAt"
                }
            }
        ])

        let monthlyData = []
        let dailyData = []

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        let monthlyMap = new Map();
        let dailyMap = new Map();

        //converting to monthly order array

        //taking the count of orders in each month
        orders.forEach((order) => {
            const date = new Date(order.orderDate);
            const month = date.toLocaleDateString('en-US', { month: 'short' });

            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, 1);
            } else {
                monthlyMap.set(month, monthlyMap.get(month) + 1);
            }
        })

        for (let i = 0; i < months.length; i++) {
            if (monthlyMap.has(months[i])) {
                monthlyData.push(monthlyMap.get(months[i]))
            } else {
                monthlyData.push(0)
            }
        }

        //taking the count of orders in each day of a week
        orders.forEach((order) => {
            const date = new Date(order.orderDate);
            const day = date.toLocaleDateString('en-US', { weekday: 'long' })

            if (!dailyMap.has(day)) {
                dailyMap.set(day, 1)
            } else {
                dailyMap.set(day, dailyMap.get(day) + 1)
            }
        })

        for (let i = 0; i < days.length; i++) {
            if (dailyMap.has(days[i])) {
                dailyData.push(dailyMap.get(days[i]))
            } else {
                dailyData.push(0)
            }
        }

        resolve({ monthlyData: monthlyData, dailyData: dailyData })

    })
},
addCoupon:(couponData) => {
  return new Promise(async (resolve, reject) => {

      const dateString = couponData.couponExpiry;
      const [year,month,day,]= dateString.split(/[-/]/);
      const date = new Date(`${year}-${month}-${day}`);
      const convertedDate = date.toISOString();

      let couponCode=voucherCode.generate({
          length: 6,
          count: 1,
          charset: voucherCode.charset("alphabetic")
      });


      const coupon = await new Coupon({
          couponName: couponData.couponName,
          code: couponCode[0],
          discount: couponData.couponAmount,
          expiryDate: convertedDate
      })

      await coupon.save()
          .then(() => {
              resolve({status:true})
          })
          .catch((error) => {
              reject(error)
          })
      })
  },









addOffer:(offerData) => {

  return new Promise(async (resolve, reject) => {

      const dateString = offerData.endDate;
      const [year,month,day] = dateString.split(/[-/]/);
      const date = new Date(`${year}-${month}-${day}`);
      const convertedDate = date.toISOString();

    

      console.log(convertedDate);

      const offer = await new Offer({
          title: offerData.name,
          category: offerData.category,
          discount: offerData.discount,
          endDate: convertedDate
      })

      await offer.save()
          .then(() => {
              resolve(offer._id)
          })
          .catch((error) => {
              reject(error)
          })
      })
  },
activeOffer: async (body) => {
  try {
    let offerid = body
    let offerdetail = await Offer.findById(offerid)
    offerdetail.offeractive = true
    await offerdetail.save()

   let discount=offerdetail.discount
   let categoryname=offerdetail.category

   let products=await product.find({productcategory:categoryname})

   for(let product of products){
    if(product.productpromotionalprice>=500){
      product.productpromotionalprice=product.productpromotionalprice-discount
      product.productoffer=true
      
      await product.save() 
    }
  
   }

   
   return({status:true})
  } 
  catch (error) {
    
  }
  
},

deactiveOffer: async (body) => {
  try {
    let offerid = body
    let offerdetail = await Offer.findById(offerid)
   offerdetail.offeractive = false
   await offerdetail.save()

   let discount=offerdetail.discount
   let categoryname=offerdetail.category

   let products=await product.find({productcategory:categoryname})

   for(let product of products){
    product.productpromotionalprice=product.productpromotionalprice+discount
    product.productoffer=false
    await product.save()
   }

   return({status:true})
  } 
  catch (error) {
    
  }
  
},




} 