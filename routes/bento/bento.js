let router=require('express').Router();
let {handleBento,getBento,updateLayout,deleteWidget}=require('../../controller/bento/bento')
let {authenticate}=require('../../middleware/auth')
router.post('/create-bento',authenticate,handleBento)
router.get('/get-bento',authenticate,getBento)
router.patch('/update-layout',updateLayout)
router.delete('/deleteWidget/:i',deleteWidget)

module.exports=router;
