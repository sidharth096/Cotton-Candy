const orderSchema = require("../models/ordermodels");
const addressSchema = require("../models/addressmodel");
const shortid = require("shortid");

const ObjectId = require("mongoose").Types.ObjectId;

function orderDate() {
  const date = new Date();
  return date;
}

module.exports = {
  orderPlacing: (order, totalAmount, cartItems, userid) => {
    return new Promise(async (resolve, reject) => {
      let status = order.payment_method == "COD" ? "placed" : "pending";
      let date = orderDate();
      let userId = userid;
      // let address= await addressSchema.findById({_id:order.addressSelected});
      let paymentMethod = order.payment_method;
      let addressId = order.address_id;
      let orderedItems = cartItems;
      let couponAmount;

      if (order.couponAmount) {
        couponAmount = order.couponAmount || 0;
      }

      const orderid = shortid.generate();

      let ordered = new orderSchema({
        orderId: orderid,
        user: userId,
        address: addressId,
        orderDate: date,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        orderStatus: status,
        orderedItems: orderedItems.products,
        coupon: couponAmount,
      });
      await ordered.save();

      let orderId = ordered._id;
      resolve(orderId);
    });
  },

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .aggregate([
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "userDetails",
            },
          },
        ])
        .then((result) => {
          resolve(result);
        });
    });
  },

  getAllOrderDetailsOfAUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const userOrderDetails = await orderSchema.aggregate([
        {
          $match: { user: new ObjectId(userId) },
        },
        {
          $lookup: {
            from: "addresses",
            localField: "address",
            foreignField: "address._id",
            as: "addressLookedup",
          },
        },
        {
          $sort: { createdAt: -1 }, // Sort by the "createdAt" field in descending order
        },
      ]);

      resolve(userOrderDetails);
    });
  },

  changeOrderStatus: async (orderId, changeStatus) => {
    try {
      const orderstatusChange = await orderSchema.findOneAndUpdate(
        { _id: orderId },
        {
          $set: {
            orderStatus: changeStatus,
          },
        }
      );

      if (orderstatusChange) {
        return { error: false, message: "order status updated" };
      } else {
        return { error: true, message: "something goes wrong updation failed" };
      }
    } catch (error) {
      throw new Error("failed to change status!something wrong");
    }
  },

  //------------------=--------------------------------------------------

  getOrderedUserDetailsAndAddress: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .aggregate([
          {
            $match: { _id: new ObjectId(orderId) },
          },

          {
            $lookup: {
              from: "addresses",
              localField: "address",
              foreignField: "_id",
              as: "userAddress",
            },
          },
          {
            $project: {
              user: 1,
              totalAmount: 1,
              paymentMethod: 1,
              address:{
                $arrayElemAt: ["$userAddress", 0]
              }
            },
          },
        ])
        .then((result) => {
          resolve(result[0]);
        });
    });
  },

   getOrderedProductsDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .aggregate([
          {
            $match: { _id: new ObjectId(orderId) },
          },
          {
            $unwind: "$orderedItems",
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $lookup: {
              from: "products",
              localField: "orderedItems.productId",
              foreignField: "_id",
              as: "orderedProduct",
            },
          },

          {
            $unwind: "$orderedProduct",
          },
          {
            $lookup: {
              from: "addresses",
              localField: "address",
              foreignField: "_id",
              as: "userAddress",
            },
          },
        ])
        .then((result) => {
          resolve(result);
        });
    });
  },

  getAllOrderStatusesCount: async () => {
    try {
      const orderStatuses = await orderSchema
        .find()
        .select({ _id: 0, orderStatus: 1 });

      const eachOrderStatusCount = orderStatusCount(orderStatuses);

      return eachOrderStatusCount;
    } catch (error) {
      console.log(error);
    }
  },
  getAllDeliveredOrders: () => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .aggregate([
          {
            $match: { orderStatus: "delivered" },
          },
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "userDetails",
            },
          },
        ])
        .then((result) => {
          resolve(result);
        });
    });
  },

  getAllDeliveredOrdersByDate: (startDate, endDate) => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .find({
          orderDate: { $gte: startDate, $lte: endDate },
          orderStatus: "delivered",
        })
        .lean()
        .then((result) => {
          resolve(result);
        });
    });
  },

  getOrderedProductsDetailsOrderSuccess: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await orderSchema
        .aggregate([
          {
            $match: { _id: new ObjectId(orderId) },
          },

          {
            $lookup: {
              from: "products",
              localField: "orderedItems.productId",
              foreignField: "_id",
              as: "orderedProduct",
            },
          },

          {
            $unwind: "$orderedProduct",
          },
        ])
        .then((result) => {
          resolve(result);
        });
    });
  },
};

function orderStatusCount(orderStatuses) {
  //to display on doughnut chart
  let counts = {};

  orderStatuses.forEach((oneStatus) => {
    let status = oneStatus.orderStatus;
    if (counts[status]) {
      counts[status]++;
    } else {
      counts[status] = 1;
    }
  });
  return counts;
}
