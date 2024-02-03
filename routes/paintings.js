const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync')
const ExpressError=require('../utils/ExpressError')
const paintings=require("../controllers/painting")
const {validatePainting}=require('../middleware')
const {ObjectId}=require("mongodb")
const User=require('../models/users')
const {isLoggedIn}=require('../middleware')
const Painting=require('../models/paintings')
const multer=require('multer');
var session = require('express-session')
const flash=require('connect-flash')
const {storage}=require('../cloudinary')
const mongoose = require('mongoose');
const upload=multer({storage});

//app.use(flash());
router.get('/home',(req,res)=>{
    res.render('home')
})
router.get('/',catchAsync(paintings.index))
router.get('/new',isLoggedIn,paintings.addnew)
router.get('/:id',catchAsync(paintings.showPainting))
router.delete('/:id',paintings.deletePainting)
router.get('/:id/edit',isLoggedIn,catchAsync(paintings.showEditpage))
router.post('/',upload.array('image'),validatePainting,catchAsync(paintings.createPainting))
router.put('/:id',upload.array('image'),validatePainting,catchAsync(paintings.editPainting))
router.post('/:paintingId/cart',catchAsync(paintings.addToCart))
module.exports=router
