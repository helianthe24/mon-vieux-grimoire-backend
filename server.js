const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const path = require('path')
const bookRoutes = require('./routes/bookRoutes')
const authRoutes = require('./routes/authRoutes')
const errorHandler = require('./middlewares/errorHandler')

// Configuration des variables d'environnement
dotenv.config()

const app = express()

// Middleware CORS pour permettre les requêtes cross-origin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  )
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  )
  next()
})

// Middleware de parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Connexion à MongoDB avec gestion d'erreurs améliorée
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !')
    console.log(`📊 Base de données: ${mongoose.connection.name}`)
  })
  .catch((err) => {
    console.error('❌ Connexion MongoDB échouée :', err)
    process.exit(1)
  })

// Gestion des événements de connexion MongoDB
mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB :', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB déconnecté')
})

// Routes API
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)

// Servir les fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, 'images')))

// Route de test/santé
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur Mon Vieux Grimoire API',
    version: '1.0.0',
    status: 'OK',
    timestamp: new Date().toISOString(),
  })
})

// Route pour vérifier l'état de l'API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database:
      mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
  })
})

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.originalUrl,
  })
})

// Middleware de gestion d'erreurs (doit être en dernier)
app.use(errorHandler)

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('❌ Erreur non capturée :', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('❌ Promesse rejetée non gérée :', err)
  process.exit(1)
})

// Démarrage du serveur
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`)
  console.log(`🌐 API disponible sur http://localhost:${PORT}`)
  console.log(`📚 Documentation: http://localhost:${PORT}/`)
})

// Gestion de l'arrêt propre du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...')
  server.close(() => {
    console.log('✅ Serveur arrêté proprement')
    mongoose.connection.close(() => {
      console.log('✅ Connexion MongoDB fermée')
      process.exit(0)
    })
  })
})

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...')
  server.close(() => {
    console.log('✅ Serveur arrêté proprement')
    mongoose.connection.close(() => {
      console.log('✅ Connexion MongoDB fermée')
      process.exit(0)
    })
  })
})
