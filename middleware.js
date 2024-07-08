
const {paintingSchema}=require('./schemas')
const ExpressError=require('./utils/ExpressError')
const validatePainting=(req,res,next)=>{
    console.log("validated")
    const { error } = paintingSchema.validate(req.body.painting);
    console.log("validated")
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const isLoggedIn=(req,res,next)=>{
    // console.log("req.user=",req);
    if(!req.session.user_id)
    {
       // req.session.returnTo=req.originalUrl
       // //req.flash('error','you must be signed in');
    return res.redirect('/login');
    }
    next();
}

module.exports={validatePainting,isLoggedIn}