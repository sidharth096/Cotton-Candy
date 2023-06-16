const cartSchema = require('../models/cartmodel')
const couponSchema = require('../models/coupenmodel')

module.exports={
    applyCoupon: (userId, couponCode, totalAmount) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await couponSchema.findOne({ code: couponCode });


            if (coupon && coupon.isActive == 'Active') {
                if (!coupon.usedBy.includes(userId)) {
                    let cart = await cartSchema.findOne({ user: userId })
                    let discount=coupon.discount
                    totalAmount = totalAmount -discount;
                    cart.coupon=couponCode;

                    await cart.save()

                    coupon.usedBy.push(userId);
                    await coupon.save() 

                    discount= currencyFormat(discount)
                    totalAmount= currencyFormat(totalAmount)

                    console.log(discount);
                    console.log(totalAmount);
        
                    resolve({  status: true,totalAmount,discount, message: "coupn added successfully" })
                } else {
                    resolve({ status: false, message: "Coupon code already used" })
                }
            } else {
                resolve({ status: false, message: "invalid Coupon code" })
            }
        })
    },
}


// convert a number to a indian currency format
function currencyFormat(amount) {
    return Number(amount).toLocaleString("en-in", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    });
  }