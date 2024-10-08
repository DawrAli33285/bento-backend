let bentoModel=require('../../models/bento')
const axios = require('axios');
const cheerio = require('cheerio');
const playwright = require('playwright');
let path=require('path')
const ProxyList = require('free-proxy');
let fs=require('fs').promises
const { ApifyClient } = require('apify-client');

const { ZenRows } = require("zenrows");

const {cloudinaryUpload}=require('../../utilities/cloudinary')
let browser; 
let page; 


const getBrowserInstance = async () => {

  if (!browser) {
    browser = await playwright.chromium.launch({ headless: true });
    
    page = await browser.newPage();
  }
  
  return page;
};


module.exports.handleBento = async (req, res) => {
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
      const instagramRegex =/^https:\/\/www\.instagram\.com\/[^\/]+\/?(?:\?.*)?$/;


const spotifyRegex = /^https:\/\/open\.spotify\.com\/(playlist|track|album)\/[^\/]+\/?$/;
      let githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/;
      let youtubeRegex= /youtube\.com\/(c\/|@|results|user|channel)/
      if (instagramRegex.test(url)) {
        console.log("INSTA LINK");
        const client = new ApifyClient({ token: "apify_api_njoleNAQyMd1U9Dl77EOxCaP0Y8Ai910SI2s" });

   
        const usernameRegex = /instagram\.com\/([^\/?]+)/;
        const username = url.match(usernameRegex)[1];
        
 
        const input = {
            addParentData: false,
            directUrls: [url],
            enhanceUserSearchWithFacebookPage: false,
            isUserReelFeedURL: false,
            isUserTaggedFeedURL: false,
            resultsLimit: 6,
            resultsType: "stories",
            searchLimit: 1
        };
        
       
        const [postRun, profileRun] = await Promise.all([
            client.actor('shu8hvrXbJbY3Eb9W').call(input),
            client.actor('dSCLg0C3YEZ83HzYX').call({ usernames: [username] })
        ]);
        
       
        const [postsData, profileData] = await Promise.all([
            client.dataset(postRun.defaultDatasetId).listItems(),
            client.dataset(profileRun.defaultDatasetId).listItems()
        ]);
        
   
        const { items: postsItems } = postsData;
        const { items: profileItems } = profileData;
        
    
       
        const followers = profileItems[0]?.followersCount?.toString() || '0';
        
     
        const imageUrls = postsItems
            .reduce((acc, { displayUrl }) => {
                if (displayUrl && acc.length < 4) acc.push(displayUrl);
                return acc;
            }, []);
        
       
        const uploadedImageUrls = await Promise.all(imageUrls.map(cloudinaryUpload));
        
      
        const joinedImageUrls = uploadedImageUrls
            .filter(({ url }) => url)
            .map(({ url }) => url)
            .join(',');
        
      
        bentoData = { 
            ...bentoData, 
            screenshot: joinedImageUrls,
            title: "@" + (postsItems[0]?.ownerUsername || 'Unknown'),
            followers
        };
      
      }else if(youtubeRegex.test(url)){
        
        console.log("YOUTUBE");

        const client = new ApifyClient({ token: 'apify_api_njoleNAQyMd1U9Dl77EOxCaP0Y8Ai910SI2s' });
        
      
        const input = {
          downloadSubtitles: false,
          hasCC: false,
          hasLocation: false,
          hasSubtitles: false,
          is360: false,
          is3D: false,
          is4K: false,
          isBought: false,
          isHD: false,
          isHDR: false,
          isLive: false,
          isVR180: false,
          maxResultStreams: 0,
          maxResults: 4,
          maxResultsShorts: 0,
          preferAutoGeneratedSubtitles: false,
          saveSubsToKVS: false,
          startUrls: [{ url }]
        };
        
        try {
          const run = await client.actor("h7sDV53CddomktSi5").call(input);
        
          console.log('Fetching results from dataset...');
          const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
          if (items.length === 0) {
            console.log('No items found.');
            return;
          }
        
          const followers = items[0]?.numberOfSubscribers || 0;
          let title=items[0]?.channelName||""
          const screenshot = items.map(item => item.thumbnailUrl).join(',');
        
          bentoData = {
            ...bentoData,
            followers,
            screenshot,
            title
          };
        
         
        } catch (error) {
          console.error('Error fetching data:', error);
        }
        

      }else if(githubRegex.test(url)){
console.log("GIT")
       
        const parts = url.split('/');
        const username = parts[parts.length - 1];
      
     try{
      const browser = await playwright.chromium.launch({ headless: true });
      const page = await browser.newPage();
    
      console.log("Navigating");
    
     
      await page.goto(`https://github.com/${username}`, { waitUntil: 'networkidle' });
    
      console.log("Waiting for the contribution graph");
    
      
      await page.waitForSelector('div.js-calendar-graph');
    
     
      const contributionDiv = await page.$('div.js-calendar-graph');
      
      if (contributionDiv) {
        const tempImagePath = path.join(__dirname, `${username}_contribution_graph.png`);
        
        
        await contributionDiv.screenshot({ path: tempImagePath });
    
        console.log(`Contribution graph saved as ${tempImagePath}`);
    
      
        await browser.close();
    
      let imageurl=await cloudinaryUpload( tempImagePath )
      bentoData = {
        ...bentoData,
        screenshot: (await imageurl).url,
        title:'Github'
      };
   
      } else {
        console.log('Contribution graph not found');
        await browser.close();
        return null;
      }
     }catch(e){
console.log(e.message)
     }

      }else if(spotifyRegex.test(url)){
        const [axiosData, pageInstance] = await Promise.all([
          axios.get(url),
          getBrowserInstance(),
        ]);

        const { data } = axiosData;
        
        const $ = cheerio.load(data);
        const title = $('title').text();
       console.log(title)
        const client = new ApifyClient({ token: 'apify_api_njoleNAQyMd1U9Dl77EOxCaP0Y8Ai910SI2s' });

        const input = {
          query: url, 
          limit: 4, 
        };

        const run = await client.actor('XD6mekdMpbuy5aqiI').call(input);
     
        let { items } = await client.dataset(run.defaultDatasetId).listItems();

       items=items.slice(0,4)
    
        bentoData = { ...bentoData, spotify:items,title };
      }else {
 
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

          
          const imageUrlPromise = cloudinaryUpload(screenshotBuffer);

          bentoData = {
            ...bentoData,
            screenshot: (await imageUrlPromise).url,
          };
        }
      }
    }

    const savedData = await bentoModel.create(bentoData);

   
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
       
        const updatePromises = layout.map((value) =>
            bentoModel.findOneAndUpdate(
                { i: value.i },  
                {
                    $set: {
                        x: value.x,
                        y: value.y,
                        w: value.w,
                        h: value.h,  
                        type: value.type,
                        content: value.content
                    }
                },
                { new: true } 
            )
        );

        
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