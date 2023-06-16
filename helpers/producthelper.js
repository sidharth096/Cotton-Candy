const productSchema = require('../models/productmodel')
const Cart = require('../models/cartmodel')


module.exports={
    decreaseStock: (cartItems) => {
        return new Promise(async (resolve, reject) => {

      
            for (let i = 0; i < cartItems.products.length; i++) {
                let product = await productSchema.findById({ _id: cartItems.products[i].productId._id });
     
                // console.log("decreaseStock1",product);
                const isProductAvailableInStock = (product.productquantity - cartItems.products[i].quantity) >= 0 ? true : false;
                if (isProductAvailableInStock) {
                    product.productquantity = product.productquantity - cartItems.products[i].quantity;
                }
                // else{

                // }
                await product.save();
               
            }
     
            resolve(true)
        })
    },
}
