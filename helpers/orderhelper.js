const orderSchema = require('../models/ordermodels');
const addressSchema = require('../models/addressmodel');

const ObjectId = require('mongoose').Types.ObjectId;


function orderDate() {
    const date = new Date();
    console.log(date);
    // let orderDate = date.toLocaleDateString("en-IN", {
    //     year: "numeric",
    //     month: "2-digit",
    //     day: "2-digit",
    // });
    // let orderDate=`${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    // console.log("HHHHHHHHi", orderDate);



    return date
}

module.exports = {
    orderPlacing: (order, totalAmount, cartItems,userid) => {
        return new Promise(async (resolve, reject) => {
            let status = order.payment_method == 'COD' ? 'placed' : 'pending';
            let date = orderDate();
            let userId = userid
            // let address= await addressSchema.findById({_id:order.addressSelected});
            let paymentMethod=order.payment_method;
            let addressId = order.address_id;
            let orderedItems = cartItems
            console.log("orderedItems", orderedItems);

            console.log("orderedItems orderHelper ", orderedItems);
            let ordered = new orderSchema({
                user: userId,
                address: addressId,
                orderDate: date,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                orderStatus: status,
                orderedItems: orderedItems.products
            })
            await ordered.save();
            console.log("upoladed to dbbbbbbbbbbbbbbb");
            
            let orderId=ordered._id
            console.log(orderId);
            resolve(orderId);
        })
    },


    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            await orderSchema.aggregate([
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                }
            ])
                .then((result) => {
                    console.log(result);
                    resolve(result)
                })
        })
    },

    getAllOrderDetailsOfAUser: (userId) => {
        console.log("msjsjsjs:",userId);
        return new Promise(async (resolve, reject) => {
            const userOrderDetails = await orderSchema.aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $lookup:{
                        from:'addresses',
                        localField:'address',
                        foreignField:'address._id',
                        as:'addressLookedup'
                    }
                },
              
                
            ])

            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            console.log("This is aggregation resilt", userOrderDetails);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");


            resolve(userOrderDetails)
        })
    },

    changeOrderStatus:async (orderId,changeStatus)=>{
        try {
            
           const orderstatusChange=await orderSchema.findOneAndUpdate({_id:orderId},
            {
                $set:{
                    orderStatus:changeStatus
                }
            })

            if(orderstatusChange){
                return {error:false,message:'order status updated'}
            }else{
                return {error:true,message:'something goes wrong updation failed'}
            }

        } catch (error) {
            throw new Error('failed to change status!something wrong');
        }
    },

    //------------------=--------------------------------------------------

    getOrderedUserDetailsAndAddress: (orderId) => {
        return new Promise(async(resolve,reject)=>{
            await orderSchema.aggregate([
                {
                    $match: { _id: new ObjectId(orderId) }
                },
                
                {
                    $lookup:{
                        from:'addresses',
                        localField:'address',
                        foreignField:'address._id',
                        as:'userAddress'
                    }
                },
                {
                    $project:{
                        user:1,
                        totalAmount:1,
                        paymentMethod:1,
                        address:'$userAddress'
                    }
                },
            ]).then((result)=>{
                console.log(result);
                console.log("hi");
                console.log(result);
                console.log("----------------");
                console.log(result[0].address);
                console.log("hi");

                resolve(result[0])
            })
        })
    },

    //------------------=--------------------------------------------------

    // orderDetails:(orderId)=>{
    //    return new Promise(async (resolve,reject)=>{
    //     await orderSchema.find({_id:orderId}).
    //     then((result)=>{
    //         // console.log("totalAmount",result[0].totalAmount);
    //         resolve(result[0])
    //     })
    //    })
    // },

//     getOrderedProductsDetails: (orderId) => {
//         return new Promise(async(resolve,reject)=>{
//             await orderSchema.aggregate([
//                 {
//                   $match: { _id: new ObjectId(orderId) }
//                 },
//                 {
//                   $unwind: '$orderedItems'
//                 },
//                 {
//                   $lookup: {
//                     from: 'products',
//                     localField: 'orderedItems.productId',
//                     foreignField: '_id',
//                     as: 'orderedProduct'
//                   }
//                 },
//                 {
//                   $lookup: {
//                     from: 'addresses',
//                     localField: 'address',
//                     foreignField: '_id',
//                     as: 'userAddress'
//                   }
//                 },
//                 {
//                   $unwind: '$orderedProduct'
//                 }
//               ]).then((result) => {
//                 if (result.length > 0) {
//                   const order = result[0];
//                   if (order.userAddress.length > 0) {
//                     const addressArray = order.userAddress[0].address;
//                     console.log(addressArray);
//                     // Output: Array containing the address
//                   } else {
//                     console.log('No address found');
//                   }
//                 } else {
//                   console.log('Order not found');
//                 }
//                 resolve(result);
//               });
              
//         })
//     },

getOrderedProductsDetails: (orderId) => {
    console.log("uuuuu");
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
        await orderSchema.aggregate([
            {
                $match: { _id: new ObjectId(orderId) }
            },
            {
                $unwind: '$orderedItems'
            },
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
                    as: 'orderedProduct'
                }
            },

            {
                $unwind: '$orderedProduct'
            },
            {
                $lookup:{
                    from:'addresses',
                    localField:'address',
                    foreignField:'_id',
                    as:'userAddress'
                }
            },
            

        ]).then((result) => {
            console.log("orders", result);
            resolve(result)
        })
     })
    },
 getAllOrderStatusesCount: async () => {
    try {
        const orderStatuses = await orderSchema.find().select({ _id: 0, orderStatus: 1 })

        const eachOrderStatusCount = orderStatusCount(orderStatuses);

        return eachOrderStatusCount
    } catch (error) {
        console.log(error);
    }
},
getAllDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
        await orderSchema.aggregate([
            {
                $match: { orderStatus: 'delivered' }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            }
        ])
            .then((result) => {
                resolve(result)
            })
    })
},

getAllDeliveredOrdersByDate: (startDate, endDate) => {
    console.log(endDate);
    return new Promise(async (resolve, reject) => {
      await orderSchema.find({
        orderDate: { $gte: startDate, $lte: endDate },
        orderStatus: "delivered",
      })
        .lean()
        .then((result) => {
          console.log("orders in range", result);
          resolve(result);
        });
    });
  },

getOrderedProductsDetailsOrderSuccess: (orderId) => {
    console.log("uuuuu");
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
        await orderSchema.aggregate([
            {
                $match: { _id: new ObjectId(orderId) }
            },
            
      
            {
                $lookup: {
                    from: 'products',
                    localField: 'orderedItems.productId',
                    foreignField: '_id',
                    as: 'orderedProduct'
                }
            },

            {
                $unwind: '$orderedProduct'
            },
          

        ]).then((result) => {
            console.log("orders", result);
            resolve(result)
        })
     })
    },



    


}
 

function orderStatusCount(orderStatuses) {   //to display on doughnut chart
    let counts = {};

    orderStatuses.forEach(oneStatus => {
        let status = oneStatus.orderStatus
        // console.log(typeof status);
        if (counts[status]) {
            counts[status]++;
        } else {
            counts[status] = 1;
        }

        console.log(status);
        //need to remove after adding razorpay
       
        // counts.cancelPending = 3;
        // counts.canceled = 3

    });
    console.log(counts);
    return counts
}