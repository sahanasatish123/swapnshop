const express=require("express")
const router=express.Router()
const jwt=require('jsonwebtoken')
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const {validatePainting}=require('../middleware')
const User=require('../models/users')
const users=require("../controllers/user")
const {isLoggedIn}=require('../middleware')
const Product=require("../models/paintings")
const age=3*24*60*60;
const signIn=(req,res)=>{
    res.render('users/register')
    const user=new User(req.body.user)
}
const register=async(req,res)=>{
    try{
    const user=new User(req.body.user)
    console.log(user)
    await user.save();

    req.session.user_id=user._id
    res.locals.user=user._id;
    res.redirect('/paintings')
    }
    catch(e){
        console.log(e)
        res.redirect('/register')
    }
}
const loginPage=(req,res)=>{
    res.render('users/login')
}
const login=async(req,res)=>{
    const testUser=new User(req.body.user)

   const user=await User.findOne({username:testUser.username})
    console.log(user)
   if(user){
         user.comparePassword(testUser.password, function(err, isMatch) {
         if (err) throw err;
        
        if(isMatch){
            req.session.user_id=user._id
            // console.log(req.session.user_id)
            // console.log(req.session.user_id==user._id)
            res.locals.req = req;
        
        res.redirect('/paintings')
        }
    })
}
 else{
    res.redirect('/login')
}
}
const dashboard=async(req,res)=>{
    console.log('in dashboad')
    const user = await User.findById(req.session.user_id).populate({
            path: 'orders.products.product',
            model: 'Painting',
        });
    res.render('dashboard',{user})
}
const cart=async(req,res)=>{
    const user = await User.findById(req.session.user_id).populate({
        path: 'cart.product',
        model: 'Painting', // Make sure this matches your model name
    });
    // console.log(user.cart)
    //       console.log(user.cart[0])
    //       console.log(user.cart[0].product.name)
    //       console.log(user.cart[0].product.images)
    //       console.log(user.cart[0].quantity)
    res.render('paintings/cart',{paintings:user.cart})
}
    module.exports={signIn,register,loginPage,login,dashboard,cart}