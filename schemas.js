const Joi=require('joi')
const paintingSchema=Joi.object({
    
    name:Joi.string().required(),
    description:Joi.string().required(),
    price:Joi.number().required(),
    category:Joi.string().required(),
    // artist:Joi.string().required(),
    
    deleteImages:Joi.array()
})
module.exports={paintingSchema}