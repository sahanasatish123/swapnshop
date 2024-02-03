
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
router.get('/remove-from-cart/:productId', async (req, res) => {
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
  });
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
        console.log(user)
      }
    } catch (error) {
      throw error;
    }
  }
// router.get("/checkout",(req,res)=>{
//   res.render('paintings/checkout')
// })
router.get("/checkout", isLoggedIn, async (req, res) => {
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
        for (const orderItem of order) {
          const seller = await User.findById(orderItem.product.sellername);
          console.log(seller)
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
            console.log(seller)
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
});

const calculateTotalPrice = (user) => {
    let totalPrice = 0;

    for (const cartItem of user.cart) {
        totalPrice += cartItem.product.price * cartItem.quantity;
    }

    return totalPrice;
};

module.exports = router;
