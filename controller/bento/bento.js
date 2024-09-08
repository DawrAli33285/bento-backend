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
const fetchDataWithAxios = async (url) => {
  try {
    // Make the request with a custom User-Agent header
      // Fetch the HTML content from the URL
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      responseType: 'text', // Ensure the response type is treated as text
    });

    // Return the HTML content
    return response;
  } catch (error) {
    console.error('Error with Axios request:', error.response ? error.response.status : error.message);
    throw error; // Re-throw to handle it in the main block
  }
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
      const instagramRegex =/instagram\.com\//;
      let spotifyRegex=/spotify\.com\//
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
            resultsLimit: 4,
            resultsType: "stories",
            searchLimit: 1
        };
        
        // Fetch posts and profile data concurrently
        const [postRun, profileRun] = await Promise.all([
            client.actor('shu8hvrXbJbY3Eb9W').call(input),
            client.actor('dSCLg0C3YEZ83HzYX').call({ usernames: [username] })
        ]);
        
        // Fetch items and profile data concurrently
        const [postsData, profileData] = await Promise.all([
            client.dataset(postRun.defaultDatasetId).listItems(),
            client.dataset(profileRun.defaultDatasetId).listItems()
        ]);
        
        // Destructure the items directly
        const { items: postsItems } = postsData;
        const { items: profileItems } = profileData;
        
    
        // Get followers count
        const followers = profileItems[0]?.followersCount?.toString() || '0';
        
        // Filter and map image URLs concurrently in one step
        const imageUrls = postsItems
            .reduce((acc, { displayUrl }) => {
                if (displayUrl && acc.length < 4) acc.push(displayUrl);
                return acc;
            }, []);
        
        // Upload images to Cloudinary concurrently
        const uploadedImageUrls = await Promise.all(imageUrls.map(cloudinaryUpload));
        
        // Extract the URLs from the Cloudinary upload results and join them into a single string
        const joinedImageUrls = uploadedImageUrls
            .filter(({ url }) => url)
            .map(({ url }) => url)
            .join(',');
        
        // Structure the final data
        bentoData = { 
            ...bentoData, 
            screenshot: joinedImageUrls,
            title: "@" + (postsItems[0]?.ownerUsername || 'Unknown'),
            followers
        };
        // Optional: If you still want to upload a combined image to Cloudinary
        // Uncomment the following code if you need a combined image upload
        /*
        const combinedImageBuffer = await mergeImages(imageUrls);
        const imageUrlPromise = cloudinaryUpload(combinedImageBuffer);
        bentoData = { ...bentoData, screenshot: (await imageUrlPromise).url };
        */
      }else if(youtubeRegex.test(url)){
        // Initialize the ApifyClient with API token
        console.log("YOUTUBE");

        const client = new ApifyClient({ token: 'apify_api_njoleNAQyMd1U9Dl77EOxCaP0Y8Ai910SI2s' });
        
        // Prepare Actor input
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
    
      // Navigate to the GitHub profile page
      await page.goto(`https://github.com/${username}`, { waitUntil: 'networkidle' });
    
      console.log("Waiting for the contribution graph");
    
      // Wait for the contribution graph `div` to load
      await page.waitForSelector('div.js-calendar-graph');
    
      // Locate the contribution graph `div` and take a screenshot
      const contributionDiv = await page.$('div.js-calendar-graph');
      
      if (contributionDiv) {
        const tempImagePath = path.join(__dirname, `${username}_contribution_graph.png`);
        
        // Take a screenshot of the `div` containing the contribution graph
        await contributionDiv.screenshot({ path: tempImagePath });
    
        console.log(`Contribution graph saved as ${tempImagePath}`);
    
        // Close the browser
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

        const client = new ApifyClient({ token: 'apify_api_njoleNAQyMd1U9Dl77EOxCaP0Y8Ai910SI2s' });

        const input = {
          query: url, // Customize this as needed
          limit: 4, // Limit to 4 results
        };

        const run = await client.actor('XD6mekdMpbuy5aqiI').call(input);
        console.log('LOADING');
        let { items } = await client.dataset(run.defaultDatasetId).listItems();

       items=items.slice(0,4)
        console.log("ITEMS")
        console.log(items)
        bentoData = { ...bentoData, spotify:items };
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

          // Use a Promise to handle the Cloudinary upload
          const imageUrlPromise = cloudinaryUpload(screenshotBuffer);

          bentoData = {
            ...bentoData,
            screenshot: (await imageUrlPromise).url,
          };
        }
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