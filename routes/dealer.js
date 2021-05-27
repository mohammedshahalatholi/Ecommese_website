const { response } = require('express');
var express = require('express');
var router = express.Router();
const productHelper = require('../helper/product-helper');
const dealerHelper = require('../helper/dealer-helper');

const verifylogin = (req, res, next) => {
  if (req.session.login) {
    next()
  } else {
    res.redirect('/dealerlogin')
  }
}
/* GET home page. */
router.get('/', async function (req, res, next) {
  let dealers = req.session.dealers
  console.log(dealers)
  let cartcount = null
  // if (req.session.user) {
  //  cartcount = await dealerHelper.getcartcount(req.session.user._id)

  // }

  productHelper.getALLproducts().then((product) => {
    res.render('dealer/viewproduct', { dealer: true, product, dealers })
  })
});
router.get('/dealerlogin', (req, res) => {
  let dealers = req.session.dealers
  if (req.session.loggedin) {
    res.redirect('/dealer')
  } else {
    res.render('dealer/dealerlogin', { dealer: true, "loginerr": req.session.loginerr })
    req.session.loginerr = false
  }

})
router.get('/dealersignup', (req, res) => {
  res.render('dealer/dealersignup', { dealer: true })
})
router.post('/dealersignup', (req, res) => {
  dealerHelper.dealerSignup(req.body).then((response) => {
    console.log(response);
    req.session.loggedin = true
    req.session.dealers = response
  })
})
router.post('/dealer/dealerlogin', (req, res) => {
  dealerHelper.dealerLogin(req.body).then((response) => {
    if (response.status) {
      req.session.loggedin = true
      req.session.dealers = response.dealers
      res.redirect('/dealer')
    } else {
      req.session.loginerr = "Invalide user name or password"
      res.redirect('/dealerlogin')
    }
  })
})
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})
//router.get('/', function (req, res, next) {
//productHelper.getALLproducts().then((product)=>{
// res.render('admin/view-product', { dealer: true, product })
//})

//});

router.get('/addproduct', function (req, res) {
  res.render('dealer/addproduct', { dealer: true });
});
router.post('/addproduct', (req, res) => {
  console.log(req.body);
  console.log(req.files.image);
  productHelper.addproduct(req.body, (id) => {
    //image passing part
    let image = req.files.image
    image.mv('./public/product-image/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('dealer/addproduct', { dealer: true })
      } else {
        console.log(err);
      }
    })
  })
})
router.get('/deleteproduct/:id', (req, res) => {
  let proid = req.params.id
  console.log(proid)
  productHelper.deletproduct(proid).then((response) => {
    res.redirect('/dealer')
  })

})
router.get('/editproduct/:id', async (req, res) => {
  let product = await productHelper.productdetails(req.params.id)
  console.log(product)
  res.render('dealer/editproduct', { product })
})
router.post('/editproduct/:id', (req, res) => {
  productHelper.updateproduct(req.params.id, req.body).then(() => {
    res.redirect('/dealer')
    let id = req.params.id
    if (req.files.image) {
      let image = req.files.image
      image.mv('./public/product-image/' + id + '.jpg')
    }
  })

})



module.exports = router;











