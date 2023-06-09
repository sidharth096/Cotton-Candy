const { response } = require('express')
const adminhelper=require('../helpers/adminhelper')
const dotenv=require("dotenv");
const user =require('../models/usermodel')
const category = require ("../models/categorymodel")
const product = require ("../models/productmodel");
const orderModel = require('../models/ordermodels')
const Coupon = require('../models/coupenmodel')
const Offer = require('../models/offermodel')
const orderhelper = require('../helpers/orderhelper');
const ObjectId=require('mongoose').Types.ObjectId
dotenv.config();

module.exports={
    adminlogin:async(req,res)=>{
        try{
           
            if(req.session.admin){
                res.redirect('/admin')
            }else{
                res.render('admin/adminlogin.ejs')
            }
        }catch(err){
            console.error(err)
        }
    },
    adminpanel:async(req,res)=>{
        try{
                const orderStatus = await orderhelper.getAllOrderStatusesCount();
                const chartData=await adminhelper.getChartDetails();

                const dashboardDetails = await adminhelper.getDashboardDetails();
                dashboardDetails.totalRevenue=currencyFormat(dashboardDetails.totalRevenue)
                dashboardDetails.monthlyRevenue=currencyFormat(dashboardDetails.monthlyRevenue)

            res.render('admin/adminpanal.ejs',{dashboardDetails,chartData,orderStatus})
        }catch(err){
            console.error(err)
        }
    },
    

    adminpostlogin: async(req,res)=>{
      try {
        if(req.body.email=="admin@gmail.com" &&req.body.password=="123"){ 
           req.session.admin=true 
           
          res.redirect('/admin/adminpanel') 
         
       }else{
          let msg="Invalid email or password"
          res.render('admin/adminlogin.ejs',{msg})
       }  
      } catch (error) {
        
      }
       
        
      },
       adminlogout: async(req,res)=>{
        req.session=false
        res.redirect("/admin")
      },
    userslist: async(req,res)=>{
      try {
        const count = parseInt(req.query.count) || 10;
        const page = parseInt(req.query.page) || 1;
        const totalCount = await  user.countDocuments();
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
        let users=await user.find().sort({createdAt:-1}).skip(startIndex)
        .limit(count)
        .lean();
        res.render("admin/userslist.ejs",{users,pagination})
      } 
      catch (error) {
        
      }
     
        
    },
    viewuser: async(req,res)=>{
        let userid=req.params.id
        console.log(userid);
        console.log("asas");
        let userdetails=await user.findById(userid)
        console.log(userdetails);
        res.render("admin/viewuser.ejs",{userdetails})
    },
    categories:async(req,res)=>{
      
        try {
            let categories = await category.find()
            console.log(categories);
            res.render("admin/product-categories.ejs",{categories})
        } catch (err) {
            console.error(err)
        }
     },
     addcategory:(req,res)=>{
        try{
        adminhelper.addCategories(req.body).then((response)=>{
            console.log(response);
            res.json(response)
            // res.redirect("/admin/categories")
        })  
        } catch (err) {
            console.error(err)
        }
     },
     productlist:async(req,res)=>{
        try{

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
             
            let products = await product.find().sort({createdAt:-1}).skip(startIndex)
        .limit(count)
        .lean();

            res.render("admin/product-list.ejs",{products,pagination})
        } catch (err) {
            console.error(err)
        }
     },
     addproduct:async(req,res)=>{
        try {
            let categories = await category.find()
            res.render("admin/addproduct.ejs",{categories})
        } catch (error) {
            console.error(err)
        }
     },
     addproductpost:async(req,res)=>{
        try {
            
         console.log("================================");
            console.log(req.files);
            let images=req.files
            adminhelper.addproduct(req.body,images).then((response)=>{
                res.redirect("/admin/productlist")
            })
            
        } catch (error) {   
            
        }
     },
     blockuser:async(req,res)=>{
        try {
            console.log("kkk");
            let userid=req.params.id ;
            console.log(userid);
            adminhelper.blockuser(userid).then((responce)=>{
                console.log(responce);
                req.session.user=false
                res.redirect('/admin/userslist')
            })
        } catch (error) { 
            
        }
     },
     unblockuser:async(req,res)=>{
        try {
            let userid=req.params.id ;
            adminhelper.unblockuser(userid).then((responce)=>{
                console.log(responce);
                res.redirect('/admin/userslist')
            })
        } catch (error) {
            
        }
     },
     editproduct:async(req,res)=>{
        try {
            let productid=req.params.id;
            let productdetails= await product.findById(productid)
            let categories = await category.find()
            res.render('admin/editproduct.ejs',{productdetails,categories})
        } catch (error) {
            
        }
     } ,


     //Delete

     deleteproduct:async(req,res)=>{
        try {
            let productid=req.params.id
            adminhelper.deleteproduct(productid).then((response)=>{
                res.json(response)
            })
        } catch (error) {
            
        }
     },
     deletecategory:async(req,res)=>{
        try {
            console.log("vvvvvv");
            let productid=req.params.id
            adminhelper.deletecategory(productid).then((response)=>{
                res.redirect('/admin/categories')
            })
        } catch (error) {
            
        }
     },
     deleteCoupon:async(req,res)=>{
      try {
          let couponid=req.params.id
          adminhelper.deleteCoupon(couponid).then((response)=>{
              res.json(response)
          })
      } catch (error) {
          
      }
    },
    deleteOffer:async(req,res)=>{
      try {
          let offerId=req.params.id
          adminhelper.deleteOffer(offerId).then((response)=>{
              res.json(response)
          })
      } catch (error) {
          
      }
    },
    activeOffer:async(req,res)=>{
      try {
          let offerId=req.params.id
          adminhelper.activeOffer(offerId).then((response)=>{
              res.json(response)
          })
      } catch (error) {
          
      }
    },
    deactiveOffer:async(req,res)=>{
      try {
          let offerId=req.params.id
          adminhelper.deactiveOffer(offerId).then((response)=>{
              res.json(response)
          })
      } catch (error) {
          
      }
    },












     deactiveproduct:async(req,res)=>{
        try {
            console.log("haaa");
            let productid=req.params.id
            adminhelper.deactiveproduct(productid).then((response)=>{
                res.redirect('/admin/productlist')
            })
        } catch (error) {
            
        }
     },
     activeproduct:async(req,res)=>{
        try {
            let productid=req.params.id
            adminhelper.activeproduct(productid).then((response)=>{
                res.redirect('/admin/productlist')
            })
        } catch (error) {
            
        }
     },

     logout:async(req,res)=>{
        try {
            req.session.admin=false
            res.redirect('/admin')
        } catch (error) {
            
        }
     },
     editproductpost:async(req,res)=>{ 
        try {
            let productid=req.params.id
            console.log("==========");
            console.log(req.body);
            console.log("==========");
            console.log(req.files);
            adminhelper.editproduct(req.body,req.files,productid).then((response)=>{
                  res.redirect('/admin/productlist')
             })
        } catch (error) {
            
        }
    },
    orderlist:async(req,res)=>{ 
        try {
            const count = parseInt(req.query.count) || 5;
            const page = parseInt(req.query.page) || 1;
            const totalCount = await  orderModel.countDocuments();
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
          let orders= await orderhelper.getAllOrders()
          console.log(orders[0].userDetails);
          
          res.render('admin/orderlist.ejs',{orders,pagination}) 
             
        } catch (error) {
            
        }
     },
    //  orderDetailadmin:async(req,res)=>{ 
    //     try {
    //    console.log("hhh");
    //       res.render('admin/orderdetailadmin')
             
    //     } catch (error) {
            
    //     }
    //  },
     orderDetailadmin: async (req, res) => {
        console.log("000000000");
        let orderId = req.params.id;
        console.log(orderId);
       
        try {
          const order = await orderModel.aggregate([
            { $match: { _id: new ObjectId(orderId) } },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user'
              }
            },
            { $unwind: '$user' },
            {
              $lookup: {
                from: 'products',
                localField: 'orderedItems.productId',
                foreignField: '_id',
                as: 'orderedItems.productId'
              }
            },
         
            {
              $lookup: {
                from: 'addresses',
                localField: 'address',
                foreignField: ' _id',
                as: 'address'
              },              

             },
            
           
          ]);
          console.log("tttttttttt");
         console.log(order);
          res.render('admin/orderdetailadmin',{ Order: order[0] })
        } catch (err) {
          console.log(err);
          res.status(500).json({ error: 'An error occurred' });
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

      orderDelivery:async(req,res)=>{ 
        try {
          let orderId=req.params.id
          console.log("anamaamana");
          console.log(orderId);
          await orderModel.updateOne(
            { _id: orderId },
            {
              $set: {
                orderStatus: "delivered"
              }
            })
            res.json({status:true})
        
      
             
        } catch (error) {
             
          }
       },

      coupen:async(req,res)=>{ 
        try {
           let coupon= await Coupon.find()
           console.log(coupon);
           res.render('admin/coupen.ejs',{coupon})
             
        } catch (error) {
             
          }
       },
      addCoupen:async(req,res)=>{ 
        try {
           console.log("sss");
           console.log(req.body);
           adminhelper.addCoupon(req.body)
           res.redirect('/admin/coupen')
             
        } catch (error) {
             
          }
       },
      salesReportPage:async (req,res)=>{
        const sales = await orderhelper.getAllDeliveredOrders();
        console.log("sales",sales);
        // sales.forEach((order)=>{
        //   order.orderDate=dateFormat(order.orderDate)
        //   // order.totalAmount=dateFormat(order.totalAmount)
        // })
        res.render('admin/salesreport',{sales})
      },

      getReport: async (req, res) => {
        console.log(req.body);
        try {
          let { startDate, endDate } = req.body;
    
          startDate = new Date(startDate);
          endDate = new Date(endDate);
    
          const salesReport = await orderhelper.getAllDeliveredOrdersByDate(
            startDate,
            endDate
          );
          for (let i = 0; i < salesReport.length; i++) {
            salesReport[i].orderDate = dateFormat(salesReport[i].orderDate);
            salesReport[i].totalAmount = currencyFormat(salesReport[i].totalAmount);
          }
          res.status(200).json({ sales: salesReport });
        } catch (error) {
          console.log(error);
        }
      },



      offer:async(req,res)=>{ 
        try {
    //       const count = parseInt(req.query.count) || 3;
    //       const page = parseInt(req.query.page) || 1;
    //       const totalCount = await  product.countDocuments();
    //       const startIndex = (page - 1) * count;
    //       const totalPages = Math.ceil(totalCount / count);
    
    //       // Generate a random offset based on the total count and the page size
    //       const randomOffset = Math.floor(Math.random() * (totalCount - count));
    //       const endIndex = Math.min(count, totalCount - startIndex);
    //       const pagination = {
    //         totalCount: totalCount, // change this to `totalCount` instead of `totalProductsCount`
    //         totalPages: totalPages,
    //         page: page,
    //         count: count,
    //         startIndex: startIndex,
    //         endIndex: endIndex, 
    //       };
           let Category=await category.find()
           let offer= await Offer.find()
           console.log("aaa");
           console.log(Category);
           console.log(offer);
           res.render('admin/offer.ejs',{Category,offer})
             
        } catch (error) {
             
          }
       },
 
      addOffer:async(req,res)=>{ 
        try {
           console.log("sss");
           console.log(req.body);
           adminhelper.addOffer(req.body)
           res.redirect('/admin/offer')
             
        } catch (error) {
             
          }
       },



    


}
// convert a number to a indian currency format
function currencyFormat(amount){
    return Number(amount).toLocaleString('en-in', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 })
  } 