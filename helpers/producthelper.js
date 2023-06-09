const productSchema = require('../models/productmodel')
const Cart = require('../models/cartmodel')


module.exports={
    decreaseStock: (cartItems) => {
        console.log("wwwwwwwwwwwww");
        console.log(cartItems);
        console.log("099999999999999999990000000000");
        console.log(cartItems.products[0].productId._id)
        return new Promise(async (resolve, reject) => {
            console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
            // console.log("decreaseStock0",cartItems);
            for (let i = 0; i < cartItems.products.length; i++) {
                let product = await productSchema.findById({ _id: cartItems.products[i].productId._id });
                console.log("rrrrrrrrrrrrrrrrrrr");
                console.log(product);
                // console.log("decreaseStock1",product);
                const isProductAvailableInStock = (product.productquantity - cartItems.products[i].quantity) > 0 ? true : false;
                if (isProductAvailableInStock) {
                    product.productquantity = product.productquantity - cartItems.products[i].quantity;
                }
                // else{

                // }
                await product.save();
                // console.log("decreaseStock2",product);
            }
            console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
            resolve(true)
        })
    },
}
