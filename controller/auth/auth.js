let userModel=require('../../models/user')
let jwt=require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')
let nodemailer=require('nodemailer')
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



module.exports.resetPassword=async(req,res)=>{
    let {email}=req.body;
console.log(email)
try{

    let userFound=await userModel.findOne({email})
    if(!userFound){
        return res.status(400).json({
            error:"User not found"
        })
    }
let token=await jwt.sign({email:userFound.email},process.env.JWT_KEY)
const emailHtmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
  }
  .container {
    max-width: 600px;
    margin: auto;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
  .header {
    color: #333;
    text-align: center;
  }
  .review {
    background-color: #f9f9f9;
    border-left: 4px solid #007BFF;
    margin: 20px 0;
    padding: 20px;
    border-radius: 4px;
  }
  .rating {
    text-align: right;
    font-size: 18px;
    font-weight: bold;
    color: #ff9500;
  }
</style>
</head>
<body>

<div class="container">
  <div class="header">
    <h2>Welcome to Our Platform</h2>
  </div>
  <div class="review">
    <p>Hello,</p>
    <p>Welcome to our platform! We are thrilled to have you on board.</p>
   
  </div>
  <div>
   <p>Please click on the link to go to reset password page</p>
   <a href="https://bento-black.vercel.app/resetpassword?token=${token}">https://bento-black.vercel.app/resetpassword?token=${token}</a>
  </div>
</div>

</body>
</html>
`;
const transporter=nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true,
    auth: {
        user:process.env.email,
        pass: process.env.email_pass,
      },
})
const mailOptions = {
    from:process.env.email,
    to: email, 
    subject: "Reset password link",
    html: emailHtmlContent,
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.error('Error sending email:', error);
    }
    if(info){
        console.log(info)
        return res.status(200).json({
            message:"Email verification sent successfully"
        })
    }
   
});

}catch(e){
    return res.status(400).json({
        error:"Server error please try again"
    })
}
}


module.exports.newPassword=async(req,res)=>{
    let {password,token}=req.body;

    try{
   let user=await jwt.verify(token,process.env.JWT_KEY)
  await userModel.updateOne({email:user.email},{password})
  return res.status(200).json({
    message:"Passworc updated sucessfully"
  })
    }catch(e){
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}