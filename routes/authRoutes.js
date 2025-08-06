const express = require('express')
const authController = require('../controllers/authController')

const router = express.Router()

// Routes d'authentification
router.post('/signup', authController.signup)
router.post('/login', authController.login)

module.exports = router
