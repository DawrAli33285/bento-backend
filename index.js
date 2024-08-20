//imports
let cors=require('cors')
require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
let express=require('express')
let app=express();
let authRoutes=require('./routes/auth/auth')
let connection=require('./connection/connection')
let bentoroutes=require('./routes/bento/bento')
let profileroutes=require('./routes/profile/profile')
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
      // Fetch HTML data from the URL
      const { data } = await axios.get(url);
      // Load the HTML into cheerio
      const $ = cheerio.load(data);
      
      // Extract the title from the HTML
      const title = $('title').text();
      
      // Return only the title in the response
      res.json({ title });
    } catch (error) {
      // Handle errors
      res.status(500).json({ error: 'Failed to fetch metadata' });
    }
  });
  
app.use(authRoutes)
app.use(bentoroutes)
app.use(profileroutes)

app.listen(process.env.PORT,()=>{
console.log(`Listening to PORT ${process.env.PORT}`)
})
