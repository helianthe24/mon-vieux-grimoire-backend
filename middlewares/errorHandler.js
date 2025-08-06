// Middleware de gestion d'erreurs centralisé
const errorHandler = (err, req, res, next) => {
  console.error('Erreur capturée:', err)

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => error.message)
    return res.status(400).json({
      message: 'Erreur de validation',
      errors,
    })
  }

  // Erreur de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'ID invalide',
    })
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      message: `${field} déjà existant`,
    })
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide',
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expiré',
    })
  }

  // Erreur Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      message: 'Fichier trop volumineux',
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      message: 'Type de fichier non autorisé',
    })
  }

  // Erreur par défaut
  res.status(err.status || 500).json({
    message: err.message || 'Erreur interne du serveur',
  })
}

module.exports = errorHandler
