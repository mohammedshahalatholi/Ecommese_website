const { response } = require('express')
const { reject, resolve } = require('promise')
var db = require('../config/connection')
var collection = require('../config/connections')
var ObjectID = require('mongodb').ObjectID
module.exports = {
    adddealer: (admin, callback) => {
        //  console.log(product);

        db.get().collection(collection.DEALER_ADD).insertOne(admin).then((data) => {
            //console.log(data)
            callback(data.ops[0]._id)
        })
    },
    //use to print array of insert element
    getALLproducts: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.DEALER_ADD).find().toArray()
            resolve(admin)
        })
    },
    deletproduct: (did) => {
        return new Promise((resolve, reject) => {
            console.log(ObjectID(did))
            db.get().collection(collection.DEALER_ADD).removeOne({ _id: ObjectID(did) }).then((response) => {
                resolve(response)

            })
        })

    },
    productdetails: (did) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DEALER_ADD).findOne({ _id: ObjectID(did) }).then((admin) => {
                resolve(admin)
            })
        })
    },
    updateproduct: (did, dedetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DEALER_ADD)
                .updateOne({ _id: ObjectID(did)}, {
                $set: {
                    name: dedetails.name,
                    catogary: dedetails.catogary,
                    content: dedetails.content
                }

            }).then((response) => {
                resolve()

            })

        })
    },
    addproduct: (admin, callback) => {
        //  console.log(product);

        db.get().collection('dealers').insertOne(admin).then((data) => {
            //console.log(data)
            callback(data.ops[0]._id)
        })
    },
    //use to print array of insert element
    getALLproducts: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.DEALER_ADD).find().toArray()
            resolve(admin)
        })
    },
    deletproduct: (did) => {
        return new Promise((resolve, reject) => {
            console.log(ObjectID(did))
            db.get().collection(collection.DEALER_ADD).removeOne({ _id: ObjectID(did) }).then((response) => {
                resolve(response)

            })
        })

    },
    productdetails: (did) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DEALER_ADD).findOne({ _id: ObjectID(did) }).then((admin) => {
                resolve(admin)
            })
        })
    },
    updateproduct: (did, dedetails) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.DEALER_ADD)
                .updateOne({ _id: ObjectID(did)}, {
                $set: {
                    name: dedetails.name,
                    catogary: dedetails.catogary,
                    content: dedetails.content
                }

            }).then((response) => {
                resolve()

            })

        })
    }




}