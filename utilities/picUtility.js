let multer = require('multer');

let memoryStorage = multer.memoryStorage();

let fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new Error("Invalid format"), false); 
    }
};

let picStorage = multer({
    storage: memoryStorage,
    fileFilter: fileFilter
});

module.exports = picStorage;
