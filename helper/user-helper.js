var db = require('../config/connection')
var collection = require('../config/connections')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const connections = require('../config/connections')
const { response } = require('express')
const { ObjectId } = require('mongodb')
var ObjectID = require('mongodb').ObjectID



module.exports = {


    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.ops[0])
            })

        })
    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        console.log('login success full')
                        response.user = user
                        response.status = true
                        resolve(response)

                    } else {
                        console.log('login fail')
                        resolve({ status: false })
                    }
                })
            } else {
                console.log('login fail')
                resolve({ status: false })
            }
        })
    },
    getAllProducts:(dealerId)=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({Status:"Enabled",dealer:String(dealerId)}).toArray()
            resolve(products)
        })
    },
    
    addtocart: (proid, userid) => {
        let proObj={
            item:ObjectID(proid),
            quantity:1
        }
        return new Promise(async (resolve, reject) => {
            let usercart = await db.get().collection(connections.CART_COLLECTION).findOne({ user: ObjectID(userid) })
            if (usercart) {
                let proExist=usercart.product.findIndex(product=>product.item==proid)
                console.log(proExist);
                if(proExist){
                    db.get().collection(collection.CART_COLLECTION)
                    .updateOne({user:ObjectID(userid),'products.item':ObjectId(proid)},
                    {
                        $inc:{'product.$.quantity':1}
                    }).then(()=>{
                        resolve()
                    })
                }
                else{
                    db.get().collection(connections.CART_COLLECTION)
                    .updateOne({ user: ObjectID(userid) },
                        {
                            $push: { products: proObj }
                        }
                    ).then((response) => {
                        resolve()

                    })


                }
               
            } else {
                let cartObj = {
                    user: ObjectID(userid),
                    product: [proObj]
                }
                db.get().collection(connections.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }

        })
    },
    getcartproducts: (userid) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(connections.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userid) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'

                    }
                },
                {
                    $lookup: {
                        from: connections.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, products: { $arrayElemAt: ['$product', 0] }
                    }

                }
                      
                     
              
            ]).toArray()
            
        resolve(cartItems)
        
    })


},
getTotalAmount:(userId,dealerId)=>{
    console.log(dealerId);
    return new Promise(async(resolve,reject)=>{
        let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{user:objectId(userId),dealer:objectId(dealerId)}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
            },
            {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity','$product.Price']}}
                }
        
            }


           
        ]).toArray()
        
    
        resolve(total[0].total)

    })
},
getTotalAmount:(userId,dealerId)=>{
        console.log(dealerId);
        return new Promise(async(resolve,reject)=>{
            let total=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId),dealer:objectId(dealerId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                },
                {
                    $project:{
                        item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                    }
                },
                {
                    $group:{
                        _id:null,
                        total:{$sum:{$multiply:['$quantity','$product.Price']}}
                    }
            
                }


               
            ]).toArray()
            
        
            resolve(total[0].total)

        })
    },
    getcartcount: (userid) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectID(userid) })
            if (cart) {
                count = cart.product.length
            } resolve(count)
        })
    },
        changeproductQuantity: (details) => {
            details.count = parseInt(details.count)
            details.quantity = parseInt(details.quantity)

            return new Promise((resolve, reject) => {
                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(details.cart) },
                        {
                            $pull: { product: { item: ObjectId(details.cart) } }
                        }).then((response) => {
                            resolve({ removeproduct: true })
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        _id: ObjectId(details.cart),
                        'product.item': ObjectId(details.product)
                    },
                        {
                            $inc: { 'product.$.quantity': details.count }
                        }).then((response) => {
                            resolve(true)
                        })
                }
            })

        },
            getuserorder: (userid) => {
                return new Promise(async (resolve, reject) => {
                    let userorder = await db.get().collection(connections.ORDER_COLLECTION).find({ user: ObjectID(userid) }).toArray()
                    console.log(userorder)
                    resolve(userorder)
                })
            },
            getALLshop: () => {
                return new Promise(async (resolve, reject) => {
                    let shop = await db.get().collection(collection.DEALER_ADD).find().toArray()
                    resolve(shop)
                })
            
            // }, getorderproducts: (userid) => {
            //     return new Promise(async (resolve, reject) => {
            //         let cartitems = await db.get().collection(connections.CART_COLLECTION).aggregate([
            //             {
            //                 $match: { user: ObjectId(userid) }
            //             },
            //             {
            //                 $lookup: {
            //                     from: connections.PRODUCT_COLLECTION,
            //                     let: { prolist: '$product' },
            //                     pipeline: [
            //                         {
            //                             $match: {
            //                                 $expr: {
            //                                     $in: ['$_id', "$$prolist"]
            //                                 }


            //                             }
            //                         }
            //                     ],
            //                     as: 'cartitems'
            //                 }
            //             }
            //         ]).toArray()
            //         resolve(cartitems[0].cartitems)
            //     })

            }

    
// }
// var express = require('express');
// var router = express.Router();
// var db=require('../config/connection')
// var collections=require('../config/connections')
// const bcrypt=require('bcrypt');
// var objectId=require('mongodb').ObjectID
// const { ObjectId } = require('mongodb');
// const { response } = require('express');

// module.exports={
//     getAllVendors:()=>{
//         return new Promise(async(resolve,reject)=>{
//             let vendors=await db.get().collection(collections.DEALER_COLLECTION).find({flag:"unban"}).toArray()
//             resolve(vendors)
//         })
//     },
//     getAllProducts:(dealerId)=>{
//         return new Promise(async(resolve,reject)=>{
//             let products=await db.get().collection(collections.PRODUCT_COLLECTION).find({Status:"Enabled",dealer:String(dealerId)}).toArray()
//             resolve(products)
//         })
//     },

//     addToCart:
//     (proId,dealerId,userId)=>{
//         let proObj={
//             item:objectId(proId),
//             quantity:1
//         }
//         return new Promise(async(resolve,reject)=>{
//             let userCart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId),dealer:objectId(dealerId)})
//             if(userCart){
//                 let proExist=userCart.products.findIndex(product=> product.item==proId)
//                 console.log(proExist);
//                 if(proExist!=-1){
//                     db.get().collection(collections.CART_COLLECTION)
//                     .updateOne({user:objectId(userId),'products.item':objectId(proId)},
//                     {
//                         $inc:{'products.$.quantity':1}
//                     }
//                     ).then(()=>{
//                         resolve()
//                     })
//                 }else{
                    
//                 db.get().collection(collections.CART_COLLECTION)
//                 .updateOne({user:objectId(userId),dealer:objectId(dealerId)},
//                     {
                        
//                         $push:{products:proObj}
                        
//                     }
//                 ).then((response)=>{
//                     resolve()
//                 })
//                 }
//             }else{
//                 let cartObj={
//                     user:objectId(userId),
//                     dealer:objectId(dealerId),
//                     products:[proObj]
//                 }
//                 db.get().collection(collections.CART_COLLECTION).insertOne(cartObj).then((response)=>{
//                     resolve()
//                 })
//             }
//         })
//     },
    
//     doSignup: (userDetails) => {
//         return new Promise(async (resolve, reject) => {
//             userDetails.password = await bcrypt.hash(userDetails.password, 10)
//             db.get().collection(collections.USER_COLLECTION).insertOne(userDetails).then((data) => {

//                 resolve(data.ops[0])
//             })

//         })
//     },
//     doLogin: (userData) => {
//                 return new Promise(async (resolve, reject) => {
//                     let loginstatus = false
//                     let response = {}
//                     let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
//                     if (user) {
//                         bcrypt.compare(userData.password, user.password).then((status) => {
//                             if (status) {
//                                 console.log('login success full')
//                                 response.user = user
//                                 response.status = true
//                                 resolve(response)
        
//                             } else {
//                                 console.log('login fail')
//                                 resolve({ status: false })
//                             }
//                         })
//                     } else {
//                         console.log('login fail')
//                         resolve({ status: false })
//                     }
//                 })
//             },
//     // doLogin:(userDetails)=>{
//     //     return new Promise(async (resolve,reject)=>{
//     //         let loginStatus=false
//     //         let response={}
//     //         let customer=await db.get().collection(collections.USER_COLLECTION).findOne({email:userDetails.email})
//     //         if(customer){
//     //             bcrypt.compare(userDetails.Password,customer.Password).then((status)=>{
//     //                 if(status){
//     //                     console.log('login success');
//     //                     response.customer=customer
//     //                     response.status=true
//     //                     resolve(response)
//     //                 }else{
//     //                     console.log('login failed');
//     //                     resolve({status:false})
//     //                 }
//     //             })
//     //         }else{
//     //             console.log('login failed');
//     //             resolve({status:false})
//     //         }
//     //     })
//     // },

//     getCartCount:(userId)=>{
//         return new Promise(async(resolve,reject)=>{
//             let count=0
//             let cart=await db.get().collection(collections.CART_COLLECTION).findOne({user:objectId(userId)})
//             if(cart){
//                 count=cart.products.length
//             }
//             resolve(count)
//         })
//     },

//     getCartProducts:(userId,dealerId)=>{
//         return new Promise(async(resolve,reject)=>{
//             let cartItems=await db.get().collection(collections.CART_COLLECTION).aggregate([
//                 {
//                     $match:{user:objectId(userId),dealer:objectId(dealerId)}
//                 },
//                 {
//                     $unwind:'$products'
//                 },
//                 {
//                     $project:{
//                         item:'$products.item',
//                         quantity:'$products.quantity'
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:collections.PRODUCT_COLLECTION,
//                         localField:'item',
//                         foreignField:'_id',
//                         as:'product'
//                     }
//                 },
//                 {
//                     $project:{
//                         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
//                     }
//                 }

               
//             ]).toArray()
           
//             resolve(cartItems)

//         })
//     },


//     getTotalAmount:(userId,dealerId)=>{
//         console.log(dealerId);
//         return new Promise(async(resolve,reject)=>{
//             let total=await db.get().collection(collections.CART_COLLECTION).aggregate([
//                 {
//                     $match:{user:objectId(userId),dealer:objectId(dealerId)}
//                 },
//                 {
//                     $unwind:'$products'
//                 },
//                 {
//                     $project:{
//                         item:'$products.item',
//                         quantity:'$products.quantity'
//                     }
//                 },
//                 {
//                     $lookup:{
//                         from:collections.PRODUCT_COLLECTION,
//                         localField:'item',
//                         foreignField:'_id',
//                         as:'product'
//                     }
//                 },
//                 {
//                     $project:{
//                         item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
//                     }
//                 },
//                 {
//                     $group:{
//                         _id:null,
//                         total:{$sum:{$multiply:['$quantity','$product.Price']}}
//                     }
            
//                 }


               
//             ]).toArray()
            
        
//             resolve(total[0].total)

//         })
//     },

 }
        
