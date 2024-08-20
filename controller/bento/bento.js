let bentoModel=require('../../models/bento')
const axios = require('axios');
const cheerio = require('cheerio');
module.exports.handleBento=async(req,res)=>{
let {...bentoData}=req.body;
console.log(bentoData)
bentoData={...bentoData,user:req.user.email._id}   
try{
    if(bentoData.type=="link"){
        let url = bentoData.content;
  
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }
      
        
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }
        const { data } = await axios.get(url);
       
        const $ = cheerio.load(data);
        
       
        const title = $('title').text();
        
 bentoData={...bentoData,title}
    }
 let data=await bentoModel.create(bentoData)
   return res.status(200).json({
  data
   })
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}


module.exports.getBento=async(req,res)=>{
    try{
let bento=await bentoModel.find({user:req.user.email._id})
if(bento){
    return res.status(200).json({
        bento
    })
}else{
    return res.status(200).json({
     bento:[] 
    })
}
    }catch(e){
        console.log(e.message)
        return res.status(400).json({
            error:"Server error please try again"
        })
    }
}



module.exports.updateLayout = async (req, res) => {
    let layout = req.body;

    try {
        // Create an array of promises
        const updatePromises = layout.map((value) =>
            bentoModel.findOneAndUpdate(
                { i: value.i },  // Use the 'i' field as the identifier
                {
                    $set: {
                        x: value.x,
                        y: value.y,
                        w: value.w,
                        h: value.h,  // Update additional fields as needed
                        type: value.type,
                        content: value.content
                    }
                },
                { new: true }  // Return the updated document
            )
        );

        // Wait for all promises to resolve
        await Promise.all(updatePromises);

        return res.status(200).json({
            message: "SUCCESS"
        });

    } catch (e) {
        console.log(e.message);
        return res.status(400).json({
            error: "Server error, please try again"
        });
    }
};





module.exports.deleteWidget=async(req,res)=>{
   let {i}=req.params; 
    try{
await bentoModel.deleteOne({i})
return res.status(200).json({
    message:"Sucess"
})
    }catch(e){
        console.log(e.message);
        return res.status(400).json({
            error: "Server error, please try again"
        });
    }
}