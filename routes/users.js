
const express=require("express")
const router=express.Router()
const jwt=require('jsonwebtoken')
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const {validatePainting}=require('../middleware')
const User=require('../models/users')
const users=require("../controllers/user")
const {isLoggedIn}=require('../middleware')
const paintings = require("../models/paintings")
const age=3*24*60*60;
const createToken=(id)=>{
    return jwt.sign({id},'secretbyme',{
expiresIn:age
    });
}
router.get('/register',users.signIn)
router.post('/register',users.register)
router.get('/logout',(req,res)=>{
    req.session.user_id=null;
    res.redirect('/paintings')
})
router.get('/login',users.loginPage)
router.post('/login',users.login)
router.get('/dashboard',isLoggedIn,users.dashboard)
router.get('/cart',isLoggedIn,users.cart)
router.get('/:userId/cart',isLoggedIn,users.cart)
router.get('/remove-from-cart/:productId',users.removeprod);

router.get("/checkout", isLoggedIn,users.checkout);

module.exports = router;
