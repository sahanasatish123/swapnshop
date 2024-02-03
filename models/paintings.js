const mongoose=require('mongoose');
const Schema=mongoose.Schema
const User=require('./users')

const PaintingSchema=new Schema({
    name:String,
    price:Number,
    description:String,
    category:String,
    images:[{
        url:String,
        filename:String
    }],
    
    sellername:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
//description,size,about the artist
})
module.exports=mongoose.model('Painting',PaintingSchema)