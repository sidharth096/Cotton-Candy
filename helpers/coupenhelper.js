const cartSchema = require('../models/cartmodel')
const couponSchema = require('../models/coupenmodel')

module.exports={
    applyCoupon: (userId, couponCode, totalAmount) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await couponSchema.findOne({ code: couponCode });
            console.log("couponnnnnn", coupon);

            if (coupon && coupon.isActive == 'Active') {
                if (!coupon.usedBy.includes(userId)) {
                    let cart = await cartSchema.findOne({ user: userId })
                    const discount=coupon.discount
                    console.log("cartttttttt", cart);

                    // totalAmount=totalAmount-coupon.discount
                    // console.log("1111111111111",typeof totalAmount);
                    totalAmount = totalAmount -discount;
                    cart.coupon=couponCode;
                    // console.log("2222222222222",typeof cart.totalAmount);
                    await cart.save()
                    // console.log("3333333333333");
                    coupon.usedBy.push(userId);
                    await coupon.save()
                    console.log("ccc");
                    console.log(discount);
                    console.log(cart);
                    console.log(totalAmount);
        
                    resolve({  status: true,totalAmount, message: "coupn added successfully" })
                } else {
                    resolve({ status: false, message: "Coupon code already used" })
                }
            } else {
                resolve({ status: false, message: "invalid Coupon code" })
            }
        })
    },
}