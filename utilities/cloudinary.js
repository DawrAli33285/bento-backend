const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); // Helper to convert buffer to stream

cloudinary.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret,
});

module.exports.cloudinaryUpload = (fileInput) => {
  return new Promise((resolve, reject) => {
    if (Buffer.isBuffer(fileInput)) {
      // If the input is a buffer, upload it via stream
      let stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              url: result.secure_url,
            });
          }
        }
      );

      // Convert buffer to stream and pipe it to Cloudinary
      streamifier.createReadStream(fileInput).pipe(stream);
    } else if (typeof fileInput === 'string') {
      // If the input is a string (file path), upload directly
      cloudinary.uploader.upload(fileInput, { resource_type: 'auto' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
          });
        }
      });
    } else {
      reject(new Error('Invalid input: must be a Buffer or a string'));
    }
  });
};
