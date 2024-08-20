let router=require('express').Router();
let {register,login,socialLogin,socialRegister}=require('../../controller/auth/auth')
router.post('/register',register)
router.post('/login',login)
router.post('/socialLogin',socialLogin)
router.post('/socialRegister',socialRegister)
module.exports=router;
