let router=require('express').Router();
let picMulter=require('../../utilities/picUtility')
let {authenticate}=require('../../middleware/auth')
let {updateProfilePic,getProfile,validateUserName,updateProfile}=require('../../controller/profile/profile')
router.patch('/update-profilepic',authenticate,picMulter.any(),updateProfilePic)
router.get('/getProfile',authenticate,getProfile)
router.patch('/updateProfile',authenticate,updateProfile)
router.get('/validate-userName/:userName',validateUserName)
module.exports=router;