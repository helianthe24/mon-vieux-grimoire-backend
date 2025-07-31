const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// SIGNUP
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: 'Utilisateur déjà existant' })

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = new User({ email, password: hashedPassword })
    await newUser.save()

    res.status(201).json({ message: 'Utilisateur créé avec succès' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email })
    if (!user)
      return res.status(401).json({ message: 'Utilisateur non trouvé' })

    // Comparer les mots de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid)
      return res.status(401).json({ message: 'Mot de passe incorrect' })

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.status(200).json({
      userId: user._id,
      token,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
