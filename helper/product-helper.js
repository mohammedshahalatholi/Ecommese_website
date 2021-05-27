const { response } = require('express')
const { reject, resolve } = require('promise')
var db = require('../config/connection')
var collection = require('../config/connections')
var ObjectID = require('mongodb').ObjectID
module.exports = {
    addproduct: (product, callback) => {
        //  console.log(product);

        db.get().collection('product').insertOne(product).then((data) => {
            //console.log(data)
            callback(data.ops[0]._id)
        })
    },
    //use to print array of insert element
    // getAllProducts:(dealerId)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({Status:"Enabled",dealer:String(dealerId)}).toArray()
    //         resolve(products)
    //     })
    // },
    deletproduct: (proid) => {
        return new Promise((resolve, reject) => {
            console.log(ObjectID(proid))
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: ObjectID(proid) }).then((response) => {
                resolve(response)

            })
        })

    },
    productdetails: (proid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(proid) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateproduct: (proid, prodetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectID(proid)}, {
                $set: {
                    name: prodetails.name,
                    catogary: prodetails.catogary,
                    content: prodetails.content
                }

            }).then((response) => {
                resolve()

            })

        })
    },
    addproduct: (product, callback) => {
        //  console.log(product);

        db.get().collection('product').insertOne(product).then((data) => {
            //console.log(data)
            callback(data.ops[0]._id)
        })
    },
    //use to print array of insert element
    getALLproducts: (dealerid) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(product)
        })
    },
    deletproduct: (proid) => {
        return new Promise((resolve, reject) => {
            console.log(ObjectID(proid))
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({ _id: ObjectID(proid) }).then((response) => {
                resolve(response)

            })
        })

    },
    productdetails: (proid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectID(proid) }).then((product) => {
                resolve(product)
            })
        })
    },
    updateproduct: (proid, prodetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({ _id: ObjectID(proid)}, {
                $set: {
                    name: prodetails.name,
                    catogary: prodetails.catogary,
                    content: prodetails.content
                }

            }).then((response) => {
                resolve()

            })

        })
    }




}