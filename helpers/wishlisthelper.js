const wishListSchema = require('../models/wishlistmodel')
const productSchema = require('../models/productmodel');
const ObjectId = require('mongoose').Types.ObjectId;



module.exports = {
    
    addItemToWishList: (productId, userId) => {
        console.log("888888888");
        return new Promise(async (resolve, reject) => {
          if (!userId) {
            resolve({ response: false });
          }
      
          try {
            const product = await productSchema.findOne({ _id: productId });
            console.log(product);
            if (!product) {
              reject(Error("Product Not Found"));
            }
      
            const wishlist = await wishListSchema.findOne({ user: userId });
            if (!wishlist) {
              // Create a new wishlist for the user if it doesn't exist
              const newWishlist = new wishListSchema({
                user: userId,
                products: [{ productItemId: productId }],
              });
              await newWishlist.save();
            } else {
              // Check if the product already exists in the wishlist
              const existingProduct = wishlist.products.find(
                (item) => item.productItemId.toString() === productId.toString()
              );
              if (existingProduct) {
                resolve({ response: false, message: "Product already exists in the wishlist." });
                return;
              }
      
              // Add the product to the wishlist
              wishlist.products.push({ productItemId: productId });
              await wishlist.save();
            }
      
            console.log("1", wishlist);
            resolve({ response: true });
          } catch (error) {
            reject(error);
          }
        });
      },


    removeAnItemFromWishList: async (userId, productId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            console.log(productId);
            await wishListSchema.updateOne(
                {
                    user: userId
                },
                {
                    $pull: { products: { productItemId: productId } }
                }
            )
                .then((result) => {
                    console.log(result);
                    resolve({result,status:true})
                })
        })


    },

    getAllWishListItems: (userId) => {
        console.log("3333333333222222222");
        return new Promise(async (resolve, reject) => {
            let wishListItems = await wishListSchema.aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: "$products.productItemId",
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1,
                        product: {
                            $arrayElemAt: ['$product', 0]
                        }
                    }
                }
            ])

            resolve(wishListItems)
        })
    },

     getWishListCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let wishlist = await wishListSchema.findOne({ user: userId });
            if(wishlist){
            var wishlistCount = wishlist.products.length;
            }
            resolve(wishlistCount)
        })
    }


}
