const multer = require('multer')
const path = require('path')

// Types MIME autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images') // dossier de stockage
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_')
    const extension = MIME_TYPES[file.mimetype]
    callback(null, Date.now() + '_' + name + '.' + extension)
  },
})

module.exports = multer({ storage }).single('image')
