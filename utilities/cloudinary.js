const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name:process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});


module.exports.cloudinaryUpload=async(filetoUpload)=>{
  try{
    console.log(filetoUpload)
   const data=await cloudinary.uploader.upload(filetoUpload,{
       resource_type:'auto'
   })
   
    return {
      url:data.secure_url
    }
}catch(e){
return e
}
}
