    const walletSchema=require('../models/walletmodel');
    const ObjectId=require('mongoose').Types.ObjectId;

    module.exports={

        addMoneyToWallet:(userId,amount)=>{
            return new Promise(async (resolve,reject)=>{
                let wallet=await walletSchema.findOne({user:userId})

                console.log("wallet,",wallet);
                console.log(amount);
                console.log("wallet,",!wallet);

                if(!wallet){
                    wallet=new walletSchema({
                        user:userId,
                        walletBalance:amount
                    })
                }else{
                    console.log(typeof wallet.walletBalance,"????");
                    wallet.walletBalance+=amount;
                }

                await wallet.save();
                resolve(wallet)
            })
        },


        payUsingWallet:(userId,amount)=>{
            console.log("aaa");
            console.log(userId);
            console.log(amount);
            return new Promise(async (resolve,reject)=>{
                let wallet=await walletSchema.findOne({user:userId});
                if(wallet){
                    if(wallet.walletBalance>=amount){
                        wallet.walletBalance-=amount;
                    }else{
                        resolve(false) 
                    }
                    console.log("yes");
                    await wallet.save()
                    resolve(true)
                }else{
                    resolve(false) 
                }

                
             
            })
        },

        walletBalance:(userId)=>{
            return new Promise(async (resolve,reject)=>{
                await walletSchema.aggregate([
                {
                    $match:{user:new ObjectId(userId)}
                },
                {
                    $project:{walletBalance:1}
                }
                ])
                .then((balance)=>{
                    console.log("balance walletBalanceWalletHelper",balance);
                    if(!balance.length){
                        resolve(0)
                    }else{
                        resolve(balance[0].walletBalance)
                    }
                })
            })
        }
    }


                    