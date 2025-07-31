const express = require('express')
const router = express.Router()
const Book = require('../models/Book')
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer-config')
const optimizeImage = require('../utils/image-optimizer')
const path = require('path')

// ✅ GET ALL BOOKS (public)
router.get('/', async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ GET ONE BOOK (public)
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' })
    res.status(200).json(book)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// CREATE BOOK (protégé + image)
router.post('/', auth, multer, async (req, res) => {
  try {
    // Si une image est uploadée, on la compresse
    let imageUrl = ''
    if (req.file) {
      const optimizedPath = await optimizeImage(req.file.path)
      const fileName = path.basename(optimizedPath)
      imageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`
    }

    const bookData = req.body
    const book = new Book({
      ...bookData,
      imageUrl,
      userId: req.auth.userId,
    })

    await book.save()
    res.status(201).json(book)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// UPDATE BOOK (protégé + image)
router.put('/:id', auth, multer, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) return res.status(404).json({ message: 'Livre non trouvé' })
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    let updateData = req.body

    // Si une nouvelle image est uploadée
    if (req.file) {
      const optimizedPath = await optimizeImage(req.file.path)
      const fileName = path.basename(optimizedPath)
      const newImageUrl = `${req.protocol}://${req.get(
        'host'
      )}/images/${fileName}`
      updateData.imageUrl = newImageUrl
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    res.status(200).json(updatedBook)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// ✅ DELETE BOOK (protégé + uniquement créateur)
router.delete('/:id', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) return res.status(404).json({ message: 'Livre non trouvé' })

    // Seul le créateur peut supprimer
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé' })
    }

    await Book.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Livre supprimé' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ Ajouter une note à un livre
router.post('/:id/rating', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' })

    const userId = req.auth.userId
    const grade = req.body.grade

    // Vérifier que la note est bien entre 0 et 5
    if (grade < 0 || grade > 5) {
      return res.status(400).json({ message: 'La note doit être entre 0 et 5' })
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const alreadyRated = book.ratings.find((rating) => rating.userId === userId)
    if (alreadyRated) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre' })
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId, grade })

    // Recalculer la moyenne
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0)
    book.averageRating = (total / book.ratings.length).toFixed(2)

    await book.save()

    res.status(200).json(book)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
