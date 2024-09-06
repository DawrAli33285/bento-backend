const path = require('path');
const fs = require('fs');
let { cloudinaryUpload } = require('../../utilities/cloudinary');
const usermodel = require('../../models/user');
module.exports.updateProfilePic = async (req, res) => {
    let file = req.files[0];
    

    let directoryPath = path.join(__dirname, '../../images/profilePic');
    let imageName = `${Date.now()}-${file.originalname}-${Math.floor(Math.random() * 99999)}`;
    let finalFilePath = path.join(directoryPath, imageName);

    try {
        // Create the directory if it doesn't exist
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
        }

        // Write the file to the local directory
        fs.writeFileSync(finalFilePath, file.buffer);

        // Upload the file to Cloudinary
        let imageUrl = await cloudinaryUpload(finalFilePath);
        console.log(imageUrl);

        // Delete the file from the local directory after successful upload
        fs.unlinkSync(finalFilePath);

        // Update the user's profile picture URL in the database
        await usermodel.updateOne({ _id: req.user.email._id }, { $set: { picURL: imageUrl.url } });

        res.status(200).json({ message: "Profile picture updated successfully", imageUrl });

    } catch (e) {
        console.log(e.message);
        return res.status(400).json({
            error: "Server error, please try again"
        });
    }
};


module.exports.getProfile=async(req,res)=>{
    try{
      
let user=await usermodel.findOne({_id:req.user.email._id})
console.log(user)
return res.status(200).json({
    user
})
    }catch(e){
        console.log(e.message);
        return res.status(400).json({
            error: "Server error, please try again"
        });
    }
}


module.exports.updateProfile=async(req,res)=>{
   let {...rest}=req.body;
   console.log("BACKEND DATA")
   console.log(rest)
    try{
await usermodel.updateOne({_id:req.user.email._id},{$set:rest})
return res.status(200).json({
    message:"SUCESS"
})
   }catch(e){
    console.log(e.message);
    return res.status(400).json({
        error: "Server error, please try again"
    });
   } 
}



module.exports.validateUserName=async(req,res)=>{
let {userName}=req.params;
console.log(userName)
    try{
let userNameFound=await usermodel.findOne({userName})
console.log(userNameFound)
if(userNameFound){
 return res.status(400).json({
    error:"This username seems to be taken already..."
 })   
}else{
    return res.status(200).json({
        message:"SUCESS"
    })
}
    }catch(e){
        console.log(e.message);
        return res.status(400).json({
            error: "Server error, please try again"
        });
    }
}