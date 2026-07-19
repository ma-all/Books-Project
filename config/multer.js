const multer = require('multer')
const imageTypes = [
    'image/jpeg',
    'image/png',
]
const uploadimages = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5*1024*1024
    },
    fileFilter:(req, file, callback) => {
        if(imageTypes.includes(file.mimetype)) {
            callback(null, true)
        } else {
            callback(
                new Error(`JPG and PNG are the only image types allowed`)
            )
        }
    }
})
module.exports = uploadimages