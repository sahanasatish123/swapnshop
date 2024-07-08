const mongoose=require('mongoose')
const Schema=mongoose.Schema
const uniqueValidator = require('mongoose-unique-validator'),
bcrypt = require('bcrypt')
const Painting=require('./paintings')
SALT_WORK_FACTOR = 10;

const UserSchema=new Schema({
    username:{
        type:String,
        required:true,
        unique: 'username already exists',
    },
    address:{type: String, required: true},
    email: {type: String, required: true},
   
    password:{type:String,
    required:true},
    cart: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Painting',
          },
          quantity: {
            type: Number,
            default: 1, // You can adjust the default quantity as needed
          },
        },
      ],
    orders:[{
      products:[
        {
        product:{
          type:mongoose.Schema.Types.ObjectId,
          ref:'Painting'
        },
        quantity:{
          type:Number,
          required:true
        }
      }
      ]
      ,totalPrice: {
        type: Number,
        required: true,
    }
    
    }],
    newOrders: [
      {
          userName: {
              type: String,
              required: true,
          },
          Address: {
            type:String,
            required:true,
          },
          products: [
              {
                  productName: {
                      type: String,
                      required: true,
                  },
                  quantity: {
                      type: Number,
                      required: true,
                  },
              },
          ],
      },
  ],

},{timestamp:true});

UserSchema.plugin(uniqueValidator, {message: 'is already taken.'});

UserSchema.pre("save", function(next) {
    if(!this.isModified("password")) {
 	   return next();
    }
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = function(plaintext, callback) {
    return callback(null, bcrypt.compareSync(plaintext, this.password));
};

module.exports = mongoose.model("User", UserSchema);