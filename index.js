//imports
let cors=require('cors')
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const path=require('path')
const fs=require('fs')
let express=require('express')
let app=express();
let authRoutes=require('./routes/auth/auth')
let connection=require('./connection/connection')
let bentoroutes=require('./routes/bento/bento')
let profileroutes=require('./routes/profile/profile')
const webshot = require('webshot-node');
const {cloudinaryUpload}=require('./utilities/cloudinary')
const playwright = require('playwright');
const { chromium } = require('playwright'); 
const nodeHtmlToImage = require('node-html-to-image');
//middlewares
app.use(express.json({
    verify:(req,res,buffer)=>{
        req.rawBody=buffer.toString();
    }
}))
app.use(cors())
connection


//routes
app.get('/metadata', async (req, res) => {
  let url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Ensure URL starts with http or https
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    // Fetch HTML data from the URL to get the title
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const title = $('title').text();
       // Attempt to extract the Open Graph image
       const ogImage = $('meta[property="og:image"]').attr('content');
    
       // If no Open Graph image, fallback to favicon
       
       // If the image URL is relative, make it absolute based on the provided URL
 
   if(!ogImage){
          
    const browser = await playwright.chromium.launch();
    const page = await browser.newPage();
    

    
    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Take a screenshot of the page with the specified dimensions
    const screenshotBuffer = await page.screenshot({
      clip: { x: 0, y: 0, width: 1920, height: 1080 } // Crop to 600x600 from the top-left corner
    });

    await browser.close();
    
    const directoryPath = path.join(__dirname, 'newFolder'); // Change 'newFolder' to your desired folder name
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Generate a unique filename
    const imageName = `${Date.now()}-${title.replace(/[^a-zA-Z0-9]/g, '-')}-${Math.floor(Math.random() * 99999)}.png`;
    const filePath = path.join(directoryPath, imageName);
    
    // Write the screenshot buffer to the file
    fs.writeFileSync(filePath, screenshotBuffer);

    console.log(`Screenshot saved at: ${filePath}`);

    const imageUrl = await cloudinaryUpload(filePath);
    fs.unlinkSync(filePath)
    console.log(imageUrl)
    return res.status(200).json({
      title,
      screenshot:imageUrl.url
    })
   }
   
   return res.status(200).json({
    title,
    screenshot:ogImage
  })
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch metadata or screenshot' });
  }
});

  app.get('/',(req,res)=>{
    return res.status(200).json({
      message:"SUCESS"
    })
  })
  
app.use(authRoutes)
app.use(bentoroutes)
app.use(profileroutes)

app.listen(process.env.PORT,()=>{
console.log(`Listening to PORT ${process.env.PORT}`)
})
