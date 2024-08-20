const mongoose = require('mongoose');


const uri = 'mongodb+srv://lemightyeagle:lemightyeagle@cluster0.7b9t5dx.mongodb.net/test?retryWrites=true&w=majority';


const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(uri, options)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

module.exports = mongoose.connection;
