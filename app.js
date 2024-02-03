if(process.env.NODE_ENV!=="production")
{
    require('dotenv').config();
}
const express=require('express');
const ejsMate = require('ejs-mate');
const app=express();
const path =require('path');
const mongoose=require('mongoose');
var session = require('express-session')
const cookieParser=require('cookie-parser')
const mongoSanitize=require("express-mongo-sanitize")
const mongoStore=require('connect-mongo')(session)
const helmet=require('helmet')
app.use(helmet({
   contentSecurityPolicy:false
}))
app.set('views',path.join(__dirname,'views'));

    const dbUrl='mongodb+srv://saha_3485:saha_3485@mycluster.ckpwab6.mongodb.net/'
    mongoose.connect(dbUrl);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
   
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize());
const paintingRoutes=require('./routes/paintings')
const userRoutes=require("./routes/users")


const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true})) 
const store = new mongoStore({
    url: dbUrl,
    secret: 'thisshouldbeabettersecret!',
    touchAfter: 24 * 60 * 60,
    
});
store.on('error',(e)=>{
    console.log('some store error',e)
})
const sessionConfig={
    store:store,
    name:'mysession',
    secret: 'secterrr',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        //secure:true,
        expires:Date.now()+1000*60*60*24*7,
        
        maxAge: 1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
// app.use(flash());

app.listen(3000,()=>{
    console.log('listening')
})
app.use("/paintings",paintingRoutes)
app.use('/',userRoutes)


            
    
    


app.use((err,req,res,next)=>
{
    const{ statusCode=500}=err;
    if(!err.message) err.message="ohh no something wrong"
    res.status(statusCode).render('error',{err})
    //res.send('oh boi something is wrong')
})

app.all('*',(req,res,next)=>
{
   res.send("404!") 
})