const { response } = require('express');
var express = require('express');
const dealeradd = require('../helper/dealeradd');
const adminhelper = require('../helper/admin-helper')
const productHelper=require('../helper/product-helper')
var router = express.Router();

const verifylogin = (req, res, next) => {
  if (req.session.loggedin) {
    next()
  } else {
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let admin = req.session.admin
  console.log(admin)
  // let cartcount=null
  // if(req.session.user){
  //   cartcount=await .getcartcount(req.session.user._id)
  let adminlog = req.session.adminlog
  // }

  dealeradd.getALLproducts().then((admin) => {
    res.render('admin/view-product', { admins: true, admin, adminlog })
  })
});
router.get('/adminlogin', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/admin')
  } else {
    res.render('admin/adminlogin', { admins: true, "loginerr": req.session.loginerr })
    req.session.loginerr = false
  }

})
router.get('/adminsignup', (req, res) => {
  res.render('admin/adminsignup', { admins: true })
})
router.post('/adminsignup', (req, res) => {
  adminhelper.adminSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedin = true
    req.session.adminlog = response
  })
})
router.post('/adminlogin', (req, res) => {
  adminhelper.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedin = true
      req.session.adminlog = response.adminlog
      res.redirect('/admin')
    } else {
      req.session.loginerr = "Invalide user name or password"
      res.redirect('/admin/adminlogin')
    }
  })
})
router.get('/logoutadmin', (req, res) => {
  req.session.destroy()
  res.redirect('/admin/adminlogin')
})
router.get('/add-product', function (req, res) {
  res.render('admin/add-dealer', { admins: true });
});
router.post('/add-product', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);


  dealeradd.adddealer(req.body, (id) => {
    //image passing part
    let image = req.files.image
    image.mv('./public/product-image/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/add-dealer', { admins: true })
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/delete-product/:id', (req, res) => {
  let did = req.params.id
  console.log(did)
  dealeradd.deletproduct(did).then((response) => {
    res.redirect('/admin/')
  })

})
router.get('/edit-product/:id', async (req, res) => {
  let admin = await dealeradd.productdetails(req.params.id)
  console.log(admin)
  res.render('admin/edit-product', { admin, admins: true })
})
router.post('/edit-product/:id', (req, res) => {
  dealeradd.updateproduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    let id = req.params.id
    if (req.files.image) {
      let image = req.files.image
      image.mv('./public/product-image/' + id + '.jpg')
    }
  })

})
router.get('/admindashboard',((req,res)=>{
  productHelper.getALLproducts().then((product)=>{
    res.render('admin/admindashboard',{admins:true,product})
  })
 
}))



module.exports = router;
