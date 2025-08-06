const multer = require('multer')
const path = require('path')

// Types MIME autorisés
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images') // dossier de stockage
  },
  filename: (req, file, callback) => {
    // Nettoyer le nom de fichier
    const name = file.originalname
      .split(' ')
      .join('_')
      .replace(/[^a-zA-Z0-9._-]/g, '') // Supprimer les caractères spéciaux
    const extension = MIME_TYPES[file.mimetype]

    if (!extension) {
      return callback(new Error('Type de fichier non autorisé'), null)
    }

    callback(null, Date.now() + '_' + name + '.' + extension)
  },
})

// Filtre pour les types de fichiers
const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true)
  } else {
    callback(
      new Error(
        'Type de fichier non autorisé. Seuls les formats JPG, JPEG, PNG et WebP sont acceptés.'
      ),
      false
    )
  }
}

// Configuration Multer avec limites
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite à 5MB
    files: 1, // Un seul fichier à la fois
  },
})

module.exports = upload.single('image')
