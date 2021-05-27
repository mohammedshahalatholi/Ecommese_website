var db = require('../config/connection')
var collection = require('../config/connections')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const connections = require('../config/connections')
const { response } = require('express')
const { ObjectId } = require('mongodb')
var ObjectID = require('mongodb').ObjectID



module.exports = {


    dealerSignup: (dealerData) => {
        return new Promise(async (resolve, reject) => {
            dealerData.password = await bcrypt.hash(dealerData.password, 10)
            db.get().collection(collection.DEALER_COLLECTION).insertOne(dealerData).then((data) => {

                resolve(data.ops[0])
            })

        })
    },
    dealerLogin: (dealerData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus=false
            let response={}
            let dealers = await db.get().collection(collection.DEALER_COLLECTION).findOne({ email: dealerData.email })
            if (dealers) {
                bcrypt.compare(dealerData.password, dealers.password).then((status) => {
                    if (status) {
                        console.log('login success full')
                        response.dealers=dealers
                        response.status=true
                        resolve(response)

                     }else{
                        console.log('login fail')
                        resolve({status:false})
                    }
                })
            }else{
                console.log('login fail')
                resolve({status:false})
            }
        })
    }
}