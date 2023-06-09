const mongoose = require("mongoose");
const user = require("../models/usermodel")
const Category = require("../models/categorymodel")
const product = require("../models/productmodel")
const orderModel = require('../models/ordermodels')
const Coupon = require('../models/coupenmodel')
const Offer = require('../models/offermodel')
const voucherCode = require("voucher-code-generator")
const bcrypt = require('bcrypt')

const dotenv = require("dotenv");
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

        response.totalOrders = await orderModel.find({ orderStatus: 'placed' }).count();

        response.numberOfCategories = await Category.find({}).count();

        console.log(response);
        console.log("vvv");
        resolve(response)
    })
},
  // categories: async (body) => {
  //   try {
  //     console.log("hai");
  //     console.log(body);
  //     let name=body.category
  //     console.log(name);
  //     // let productcategory = category.find({categoryname:'name'})

  //     category.findOne({ categoryname: body.category }).then(async(oldcategory, err) => {
  //       console.log(oldcategory);
  //       if (err) {
  //         reject(err);
  //       } else {
  //         if (oldcategory) {
  //           console.log("aaaa");
  //           return{ status:false};
  //         } else {
  //           console.log("bbb");
  //           const newcategory = new category({
  //             categoryname: body.category
  //             //   Categorydescription: category.categorydescription,
  //           });
  //           await newcategory.save();
  //           return { status: true }
  //         }

  //       }
  //     }); 


  //   } catch (error) {
  //     console.error("Error adding category:", error);
  //   }
  // },
 

  addCategories: async (category) => {
    try {
      console.log("fkjgkdfjkjl");
      console.log(category);
      console.log(category.category);
      // Check if cathe category is empty or consists only of whitespace
      // if (!category.CategoryName || !category.CategoryName.trim()) {
      //   return { success: false, message: 'Category name cannot be empty' };
      // }
  
      // Check if the category name has any uppercase letters
      // if (category.CategoryName.toLowerCase() !== category.CategoryName) {
      //   return { success: false, message: 'Category name cannot contain uppercase letters' };
      // }
  
      // Check if any category already exists with the same name (case-insensitive)
      const existingCategory = await Category.findOne({
        categoryname: { $regex: new RegExp(`^${category.category}$`, 'i') }
      });
      console.log("999999999999");
      console.log(existingCategory);
  
      if (existingCategory) {
        return { status: false };
      }
  
      const newCategory = new Category({
        categoryname: category.category,
      });
      await newCategory.save();
      console.log("vannu");
      return { status: true };
    } catch (error) {
      console.error('Error adding category:', error);
      return { status: false};
    }
  },
  
  



  addproduct: async (body, file) => {
    try {

      console.log(file);

      const newproduct = new product({
        productname: body.productname,
        productsize: body.size,
        productpromotionalprice: body.promotionalprice,
        productregularprice: body.regularprice,
        productdescription: body.description,
        productquantity: body.quantity,
        productcategory: body.category,
        productimage: file.map((file) => file.filename)
      });
      await newproduct.save();
      console.log(newproduct);

    } catch (error) {
      console.error("Error addingproduct:", error);
    }
  },
   editproduct: async (body, file, productid) => {
    console.log("hello");
    console.log(file );
    
    if (file.length==0) {
      console.log("nofile");
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
            
          }
        })
    }
    else {
      console.log("file");

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
            productimage: file.map((file) => file.filename)
          }
        })
    }

  },


  blockuser: async (body) => {
    console.log("jhhh");
    let userid = body
    let userdetail = await user.findById(userid)
    userdetail.block = true
    await userdetail.save()
    console.log(userdetail);
  },
  unblockuser: async (body) => {
    let userid = body
    let userdetail = await user.findById(userid)
    userdetail.block = false
    await userdetail.save()
    console.log(userdetail);
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

      console.log("voucher code generator",couponCode[0]);

      console.log(convertedDate);

      const coupon = await new Coupon({
          couponName: couponData.couponName,
          code: couponCode[0],
          discount: couponData.couponAmount,
          expiryDate: convertedDate
      })

      await coupon.save()
          .then(() => {
              resolve(coupon._id)
          })
          .catch((error) => {
              reject(error)
          })
      })
  },
addOffer:(offerData) => {
  console.log("aaa");
  console.log(offerData);
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
    product.productpromotionalprice=product.productpromotionalprice-discount
    await product.save()
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
    await product.save()
   }

   return({status:true})
  } 
  catch (error) {
    
  }
  
},




} 