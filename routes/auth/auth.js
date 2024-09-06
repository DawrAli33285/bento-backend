let router=require('express').Router();
let {register,resetPassword,newPassword,login,socialLogin,socialRegister}=require('../../controller/auth/auth')
router.post('/register',register)
router.post('/login',login)
router.post('/socialLogin',socialLogin)
router.post('/socialRegister',socialRegister)
router.post('/resetPassword',resetPassword)
router.post('/newPassword',newPassword)
module.exports=router;
