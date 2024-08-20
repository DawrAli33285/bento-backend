let mongoose=require('mongoose')

let connection=mongoose.connect('mongodb://127.0.0.1/bento')

module.exports=connection;