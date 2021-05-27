var db = require('../config/connection')
var collection = require('../config/connections')
const bcrypt = require('bcrypt')
const { resolve, reject } = require('promise')
const connections = require('../config/connections')
const { response } = require('express')
const { ObjectId } = require('mongodb')
var ObjectID = require('mongodb').ObjectID



module.exports = {


    adminSignup: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.password = await bcrypt.hash(adminData.password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {

                resolve(data.ops[0])
            })

        })
    },
    adminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginstatus=false
            let response={}
            let adminlog = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ email: adminData.email })
            if (adminlog) {
                bcrypt.compare(adminData.password, adminlog.password).then((status) => {
                    if (status) {
                        console.log('login success full')
                        response.adminlog=adminlog
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