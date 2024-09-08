let mongoose=require('mongoose')

let userSchema=mongoose.Schema({
    userName:{
        type:String,
        required:true
    },
    bio:{
type:String,
default:''
    },
    signUpWithGoogle:{
  type:Boolean,
  default:false
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    picURL:{
        type:String,
       default:"https://cdn.pixabay.com/photo/2013/07/13/12/07/avatar-159236_1280.png"
    }
})

let usermodel=mongoose.model('user',userSchema)

module.exports=usermodel