const express = require('express')
const bookController = require('../controllers/bookController')
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer-config')

const router = express.Router()

// Routes publiques
router.get('/', bookController.getAllBooks)
router.get('/bestrating', bookController.getBestRating)
router.get('/:id', bookController.getOneBook)

// Routes protégées
router.post('/', auth, multer, bookController.createBook)
router.put('/:id', auth, multer, bookController.updateBook)
router.delete('/:id', auth, bookController.deleteBook)
router.post('/:id/rating', auth, bookController.rateBook)

module.exports = router
