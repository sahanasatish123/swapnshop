module.exports=func=>{
    return(req,res,next)=>{
        // console.log("in catchasync")
        func(req,res,next).catch(next);
    }
}