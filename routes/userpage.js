const { response } = require('express');
const json=require('express')
var express = require('express');
var router = express.Router();
const productHelper = require('../helper/product-helper');
const userHelper = require('../helper/user-helper');
const userhelper=require('../helper/user-helper');
const verifylogin=(req,res,next)=>{
if(req.session.loggedin){
  next()
}else{
  res.redirect('/login')
}
}
/* GET home page. */
router.get('/',async function (req, res, next) {
let user=req.session.user
console.log(user)
let cartcount=null
if(req.session.user){
  cartcount=await userHelper.getcartcount(req.session.user._id)

}

  productHelper.getALLproducts().then((products) => {
    res.render('user/viewproduct', { admins: false, products,user,cartcount })
  })
});
router.get('/login', (req, res) => {
  if(req.session.loggedin){
    res.redirect('/')
  }else{
    res.render('user/login',{"loginerr":req.session.loginerr})
    req.session.loginerr=false
  }
 
})
router.get('/signup', (req, res) => {
  res.render('user/signup')
})
router.post('/signup', (req, res) => {
  userHelper.doSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedin=true
    req.session.user=response
  })
})
router.post('/login',(req,res)=>{
userHelper.doLogin(req.body).then((response)=>{
 if(response.status) {
   req.session.loggedin=true
   req.session.user=response.user
  res.redirect('/')
 }else{
   req.session.loginerr="Invalide user name or password"
   res.redirect('/login')
 }
})
})
router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart',verifylogin, async(req,res)=>{
  // let dealerId=req.params.dealerId
  let user=req.session.user
  console.log(user)
  let products=await userhelper.getcartproducts(req.session.user._id)
  
  let totalValue=0
  if(products.length>0 ){
     totalValue=await userhelper.getTotalAmount(req.session.user._id)
     console.log(totalValue);
  }
  // if(req.session.user){
  //   cartCount=await userHelpers.getCartCount(req.session.user._id)
  //   }
  
  //console.log(cartCount);
  
  res.render('user/cart',{user,products,totalValue})
})
// router.get('/cart',verifylogin,async(req,res)=>{
//   let user=req.session.user
//   let products=await userhelper.getcartproducts(req.session.user._id)
//   console.log(products)
//   res.render('user/cart',{products,user:req.session.user})
// })
router.post('/add-to-cart/:id',verifylogin,(req,res)=>{
  let proId=req.body.proId
  console.log("api call")
userhelper.addtocart(req.params.id,req.session.user._id).then(()=>{
  res.redirect('/')
  res.json({status:true})
})
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body)
userhelper.changeproductQuantity(req.body).then((response)=>{
  res.json(response)
})
})
router.get('/vieworder',(req,res)=>{
// let orders=await userhelper.getuserorder(req.session.user)
// console.log(orders)
res.render('user/orderplace',{user:req.session.user})
  
 })
// router.get('/ordersuccess',(req,res)=>{
//   res.render('user/odersuccess',{user:req.session.user})
// })
router.get('/orders',async(req,res)=>{
  // let orders=await userHelper.getorderproducts(req.session.user._id)
  res.render('user/vieworder')
})
// router.get('/vieworder/:id',async(req,res)=>{
//   let products=await userhelper.getorderproducts(req.params.id)
//   res.render('user/vieworder',{user:req.session.user,products})
// })
router.get('/select-shop',((req,res)=>{
  let user=req.session.user
  userhelper.getALLshop().then((shop)=>{
    res.render('user/select-shop',{admins:false,shop,user})
  })

 
}))
router.get('/orderplace',(req,res)=>{
  res.render('user/vieworder')
})

  


module.exports = router;
