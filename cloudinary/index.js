const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name:'dfibrqhtl',
    api_key:'933839548848835',
    api_secret:"9ffm4-F5HIWnvknOUHWmKHLhP88"

});
const storage= new CloudinaryStorage({
    cloudinary,
    params:{
    folder: 'Paintings',
    allowedFormats: ['jpeg','png','jpg']
    }
});

module.exports={cloudinary,storage}