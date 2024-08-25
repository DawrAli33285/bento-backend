let userModel=require('../../models/user')
let jwt=require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
module.exports.register=async(req,res)=>{
let {email,password,userName}=req.body;
    try{
let response=await userModel.create({email,password,userName})
return res.status(200).json({
    message:"User registered successfully"
})
    }catch(error){
        console.log(error.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}

module.exports.login=async(req,res)=>{
let {email,password}=req.body;

try{
    let emailFound=await userModel.findOne({email})
if(emailFound){
let passwordMatch=await userModel.findOne({password})
if(passwordMatch){
    let token = await jwt.sign({ email: emailFound }, process.env.JWT_KEY);
emailFound=emailFound.toObject()
return res.status(200).json({
    ...emailFound,
    token
})
}else{
    return res.status(400).json({
        error:"Invalid password"
    })
}
}else{
    return res.status(400).json({
        error:"Email not found"
    })
}

    }catch(error){
        console.log(error.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}

module.exports.socialLogin=async(req,res)=>{
let {email}=req.body;

try{
let emailFound=await userModel.findOne({email})
if(!emailFound){
    return res.status(400).json({
        error:"Invalid email"
    })
}else{
    let token = await jwt.sign({ email: emailFound }, process.env.JWT_KEY);
    emailFound=emailFound?.toObject();
    return res.status(200).json({
        ...emailFound,
        token
    })
}

}catch(error){
        console.log(error.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}


module.exports.socialRegister=async(req,res)=>{
let {email,userName,profilePic}=req.body;
let password=uuidv4();  
    try{
        let userFound=await userModel.findOne({email})
        if(userFound){
            return res.status(400).json({
                error:"Email already taken"
            })
        }
await userModel.create({
    email,
    userName,
    password,
    picURL:profilePic,
    signUpWithGoogle:true
})
return res.status(200).json({
    message:"SUCESS"
})

    }catch(error){
        console.log(error.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}