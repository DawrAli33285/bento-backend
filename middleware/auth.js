let jwt=require('jsonwebtoken')


module.exports.authenticate=async(req,res,next)=>{
   
    let token=req.headers.authorization


    
    try{
        if(token.startsWith('Bearer')){
            let finalToken=token.split(' ')[1]
            let user=await jwt.verify(finalToken,process.env.JWT_KEY)
            req.user=user;
            
            next();
        }else{
            return res.status(400).json({
                error:"Unathorized user"
            })
        }
    }catch(error){
        console.log(error.message)
        return res.status(400).json({
            error:"Server error please try later"
        })
    }
}