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
    // console.log(user)
    await user.save();

    req.session.user_id=user._id
    res.locals.user=user._id;
    res.redirect('/paintings')
    }
    catch(e){
        // console.log(e)
        res.redirect('/register')
    }
}
const loginPage=(req,res)=>{
    res.render('users/login')
}
const login=async(req,res)=>{
    const testUser=new User(req.body.user)

   const user=await User.findOne({username:testUser.username})
    // console.log(user)
   if(user){
         user.comparePassword(testUser.password, function(err, isMatch) {
         if (err) throw err;
        
        if(isMatch){
            req.session.user_id=user._id
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
    // console.log('in dashboad')
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
const removeprod = async (req, res) => {
    try {
      const userId = req.session.user_id;
      const productId = req.params.productId;
  
      // Implement logic to remove the product from the user's cart
      await removeFromCart(userId, productId);
  
      // Redirect back to the cart page
      res.redirect(`/${userId}/cart`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  };
// Function to remove a product from the user's cart
async function removeFromCart(userId, productId) {
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        throw new Error('User not found');
      }
  
      // Find the cart item with the given product ID
      const cartItem = user.cart.find(item => item.product.equals(productId));
  
      if (cartItem) {
        // If the quantity is greater than 1, reduce it by 1
        if (cartItem.quantity > 1) {
          cartItem.quantity -= 1;
        } else {
          // If the quantity is 1 or less, remove the product from the cart
          user.cart = user.cart.filter(item => !item.product.equals(productId));
        }
  
        // Save the updated user document
        await user.save();
        // console.log(user)
      }
    } catch (error) {
      throw error;
    }
  }
// router.get("/checkout",(req,res)=>{
//   res.render('paintings/checkout')
// })
const checkout=async (req, res) => {
    try {
        const userId = req.session.user_id;
        const user = await User.findById(userId).populate({
            path: 'cart.product',
            model: 'Painting', // Make sure this matches your model name
        });

        // Calculate total price
        const totalPrice = calculateTotalPrice(user);

        // Create an order
        const order = user.cart.map(cartItem => ({
            product: cartItem.product,
            quantity: cartItem.quantity,
        }));

        // Add the order to the user's orders array
        user.orders.push({
            products: order,
            totalPrice: totalPrice,
        });
        for (var orderItem of order) {
          const seller = await User.findById(orderItem.product.sellername);
          // console.log(seller)
          if (seller) {
            seller.newOrders.push({
              userName: user.username,
              products: {
                productName: orderItem.product.name,
                quantity: orderItem.quantity
              }
            });
        
            // Save the updated seller
            await seller.save();
            // console.log(seller)
          } else {
            console.error(`Seller not found for product: ${orderItem.product.name}`);
          }
        }
        
        // Clear the user's cart
        user.cart = [];

        // Save the updated user
        await user.save();

        // Redirect or send a response as needed
        res.render('paintings/checkout'); // Redirect to a page indicating the order was successful
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const calculateTotalPrice = (user) => {
    let totalPrice = 0;

    for (const cartItem of user.cart) {
        totalPrice += cartItem.product.price * cartItem.quantity;
    }

    return totalPrice;
};
module.exports={signIn,register,loginPage,login,dashboard,cart,removeprod,checkout}