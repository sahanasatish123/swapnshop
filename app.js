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
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
    "https://fonts.gstatic.com/s/salsa/v21/gNMKW3FiRpKj-hmf-HY.woff2",
    "https://learn.g2.com/hs-fs/hubfs/Video%20on%20Websites.jpg?width=400&name=Video%20on%20Websites.jpg",
    "https://www.elegantthemes.com/blog/wp-content/uploads/2023/08/Illustration-of-Selling-Products-Online-Payment.jpg"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/css2?family=Salsa&display=swap",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js" ,
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css",
    "https://fonts.gstatic.com/s/salsa/v21/gNMKW3FiRpKj-hmf-HY.woff2"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfibrqhtl/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.set('views',path.join(__dirname,'views'));

    const dbUrl=process.env.DB_URL||'mongodb://127.0.0.1:27017/paintings'
    mongoose.connect(dbUrl);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});
   
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));
const paintingRoutes=require('./routes/paintings')
const userRoutes=require("./routes/users")


const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate)
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.urlencoded({extended:true})) 
const secret=process.env.SECRET||'thisshouldbeabettersecret!'
const store = new mongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60,
    
});
store.on('error',(e)=>{
    console.log('some store error',e)
})
const sessionConfig={
    store:store,
    name:'mysession',
    secret,
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
const port=process.env.PORT||3000
app.listen(port,()=>{
    console.log('listening')
})
app.get('/', (req, res) => {
    res.redirect('/paintings');
  });
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
