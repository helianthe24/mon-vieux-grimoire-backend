const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// SIGNUP - Inscription d'un nouvel utilisateur
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation des données d'entrée
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis',
      })
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format d'email invalide",
      })
    }

    // Validation mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Le mot de passe doit contenir au moins 6 caractères',
      })
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email existe déjà',
      })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    // Créer le nouvel utilisateur
    const newUser = new User({
      email,
      password: hashedPassword,
    })
    await newUser.save()

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
    })
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    res.status(500).json({
      message: 'Erreur interne du serveur',
    })
  }
}

// LOGIN - Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation des données d'entrée
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis',
      })
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Comparer les mots de passe
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
      })
    }

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.status(200).json({
      userId: user._id,
      token,
      message: 'Connexion réussie',
    })
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    res.status(500).json({
      message: 'Erreur interne du serveur',
    })
  }
}
