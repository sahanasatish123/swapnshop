const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const paintings=require("../controllers/painting")
const {validatePainting}=require('../middleware')
const User=require('../models/users')
const {isLoggedIn}=require('../middleware')
const Painting=require('../models/paintings')
const {ObjectId}=require("mongodb")
const multer=require('multer');
var session = require('express-session')
const flash=require('connect-flash')
const {storage}=require('../cloudinary')
const upload=multer({storage});
const index=async(req,res)=>{
    // req.flash('success','Successfully made a new campground!');
    
    const paintings=await Painting.find({}).populate('sellername');
 
    res.render('paintings/index',{paintings})

   
   //req.flash('success','successfully loggedin');
}
const addnew=(req,res)=>{
    res.render('paintings/new')
}
const showPainting=async(req,res)=>{
    const painting=await Painting.findById(req.params.id).populate('sellername')
    res.render('paintings/show',{painting,req})
}

const deletePainting=async(req,res)=>
{
    const {id}=req.params;
    await Painting.findByIdAndDelete(id)
    res.redirect('/paintings')
}
const showEditpage=async(req,res)=>{
    const painting=await Painting.findById(req.params.id).populate('sellername')
    res.render('paintings/edit',{painting})
}
const createPainting=async(req,res)=>{
 
    const painting=new Painting(req.body.painting);
    painting.images=req.files.map(f=>({url:f.path,filename:f.filename}))
   
    if(!req.body.painting) throw new ExpressError('invalid data',505)
  

    
    painting.sellername=req.session.user_id;
    await painting.save();
    console.log(painting)
   
 
   res.redirect(`/paintings/${painting.id}`)
}
const editPainting=async(req,res)=>{
    const {id}=req.params;

 const painting=await Painting.findByIdAndUpdate(id,{ ...req.body.painting})
   const imgs=req.files.map(f=>({
    url:f.path,
    filename:f.filename
}))
    painting.images.push(...imgs);
    
    await painting.save()
    if(req.body.deleteImages){
        for(let file in req.body.deleteImages){
            await cloudinary.uploader.destroy(file);
        }
        await painting.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}})
    }
    await painting.save()
    res.redirect(`/paintings/${painting._id}`)
}


const addToCart = async (req, res) => {
  const { paintingId } = req.params;

  try {
      const userId = req.session.user_id;
      const user = await User.findById(userId).populate('cart.product');

      // Check if the product is already in the user's cart
      const cartItem = user.cart.find(item => item.product._id.equals(paintingId));

      if (cartItem) {
          // If the product is already in the cart, increment the quantity
          cartItem.quantity += 1;
      } else {
          // If the product is not in the cart, add it
          const product = await Painting.findById(paintingId);
          console.log(product)
          user.cart.push({ product: product, quantity: 1 });
          console.log(user.cart)
          console.log(user.cart[0])
          console.log(user.cart[0].product.name)
          console.log(user.cart[0].product.images)
          console.log(user.cart[0].quantity)
      }

      // Save the updated user
      await user.save();

      // Redirect or send a response as needed
      res.redirect(`/${userId}/cart`); // Redirect to a page showing the user's cart
  } catch (error) {
    //   console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

module.exports = { index, addnew, showPainting, deletePainting, showEditpage, createPainting, editPainting, addToCart };
