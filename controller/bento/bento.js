let bentoModel=require('../../models/bento')
const axios = require('axios');
const cheerio = require('cheerio');
const playwright = require('playwright');
let path=require('path')
let fs=require('fs').promises
const {cloudinaryUpload}=require('../../utilities/cloudinary')
let browser; // Define a browser instance globally
let page; // Reuse a single page instance

// Create or reuse a persistent browser session and page if they don't exist
const getBrowserInstance = async () => {
  if (!browser) {
    browser = await playwright.chromium.launch({ headless: true });
    page = await browser.newPage();
  }
  return page;
};

module.exports.handleBento = async (req, res) => {
    console.time('handleBento'); // Start the timer
  
    let { ...bentoData } = req.body;
    bentoData = { ...bentoData, user: req.user.email._id };
  
    try {
      if (bentoData.type === "link") {
        let url = bentoData.content;
        if (!url) {
          return res.status(400).json({ error: 'URL is required' });
        }
        if (!/^https?:\/\//i.test(url)) {
          url = `https://${url}`;
        }
  
        const [axiosData, pageInstance] = await Promise.all([
          axios.get(url),
          getBrowserInstance(),
        ]);
  
        const { data } = axiosData;
        const $ = cheerio.load(data);
        const title = $('title').text();
        bentoData = { ...bentoData, title };
  
        const ogImage = $('meta[property="og:image"]').attr('content');
  
        if (ogImage) {
          bentoData = { ...bentoData, screenshot: ogImage };
        } else {
          await pageInstance.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
  
          const screenshotBuffer = await pageInstance.screenshot({
            type: 'jpeg',
            quality: 30,
            clip: { x: 0, y: 0, width: 800, height: 480 },
          });
  
          // Use a Promise to handle the Cloudinary upload
          const imageUrlPromise = cloudinaryUpload(screenshotBuffer);
  
          bentoData = {
            ...bentoData,
            screenshot: (await imageUrlPromise).url,
          };
        }
      }
  
      const savedData = await bentoModel.create(bentoData);
  
      console.timeEnd('handleBento'); // End the timer and log the elapsed time
      return res.status(200).json({ data: savedData });
    } catch (e) {
      console.error(e.message);
      return res.status(400).json({ error: "Server error, please try again" });
    }
  };

  
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