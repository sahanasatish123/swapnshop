const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:process.env.Cloud_name,
    api_key:process.env.Api_key,
    api_secret:process.env.Api_key

});
const storage= new CloudinaryStorage({
    cloudinary,
    params:{
    folder: 'Paintings',
    allowedFormats: ['jpeg','png','jpg']
    }
});

module.exports={cloudinary,storage}