const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bookRoutes = require('./routes/bookRoutes')
const authRoutes = require('./routes/authRoutes')
const path = require('path')

dotenv.config()
const app = express()

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connexion MongoDB réussie !'))
  .catch((err) => console.error('❌ Connexion MongoDB échouée :', err))

// Middleware de parsing JSON
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/images', express.static(path.join(__dirname, 'images')))

// Route test
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur Mon Vieux Grimoire API' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`))
