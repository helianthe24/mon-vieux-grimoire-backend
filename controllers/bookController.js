const Book = require('../models/Book')
const { optimizeImage, deleteImage } = require('../utils/image-optimizer')
const path = require('path')
const fs = require('fs')

// GET ALL BOOKS - Récupérer tous les livres (public)
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find()
    res.status(200).json(books)
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    res.status(500).json({
      message: 'Erreur lors de la récupération des livres',
    })
  }
}

// GET ONE BOOK - Récupérer un livre par son ID (public)
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      return res.status(404).json({
        message: 'Livre non trouvé',
      })
    }
    res.status(200).json(book)
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    res.status(500).json({
      message: 'Erreur lors de la récupération du livre',
    })
  }
}

// GET BEST RATING - Récupérer les 3 livres les mieux notés
exports.getBestRating = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3)
    res.status(200).json(books)
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs livres:', error)
    res.status(500).json({
      message: 'Erreur lors de la récupération des meilleurs livres',
    })
  }
}

// CREATE BOOK - Créer un nouveau livre (protégé)
exports.createBook = async (req, res) => {
  try {
    // Gestion du format frontend : compatibilité avec différents clients
    // Le frontend OpenClassrooms envoie les données dans req.body.book (JSON string)
    // Postman et autres clients envoient directement dans req.body
    let bookData
    if (req.body.book) {
      try {
        bookData = JSON.parse(req.body.book)
      } catch (error) {
        return res.status(400).json({
          message: 'Format de données invalide',
        })
      }
    } else {
      // Fallback : données directement dans req.body (Postman, etc.)
      bookData = req.body
    }

    // Validation des données requises
    const { title, author, year, genre } = bookData

    if (!title || !author || !year || !genre) {
      return res.status(400).json({
        message: 'Tous les champs sont requis (title, author, year, genre)',
      })
    }

    // Validation de l'année
    const currentYear = new Date().getFullYear()
    if (year < 1000 || year > currentYear) {
      return res.status(400).json({
        message: 'Année invalide',
      })
    }

    // Gestion de l'image
    let imageUrl = ''
    if (req.file) {
      try {
        const optimizedPath = await optimizeImage(req.file.path)
        const fileName = path.basename(optimizedPath)
        imageUrl = `${req.protocol}://${req.get('host')}/images/${fileName}`

        // Supprimer le fichier original après optimisation
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
      } catch (imageError) {
        console.error("Erreur lors de l'optimisation de l'image:", imageError)
        return res.status(500).json({
          message: "Erreur lors du traitement de l'image",
        })
      }
    }

    // Créer le livre
    const book = new Book({
      title,
      author,
      year: parseInt(year),
      genre,
      imageUrl,
      userId: req.auth.userId,
      ratings: [],
      averageRating: 0,
    })

    await book.save()
    res.status(201).json({
      message: 'Livre créé avec succès',
      book,
    })
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error)
    res.status(500).json({
      message: 'Erreur lors de la création du livre',
    })
  }
}

// UPDATE BOOK - Modifier un livre (protégé + propriétaire uniquement)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        message: 'Livre non trouvé',
      })
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({
        message: 'Action non autorisée',
      })
    }

    // Gestion du format frontend : compatibilité avec différents clients
    let updateData
    if (req.body.book) {
      try {
        updateData = JSON.parse(req.body.book)
      } catch (error) {
        return res.status(400).json({
          message: 'Format de données invalide',
        })
      }
    } else {
      // Fallback : données directement dans req.body (Postman, etc.)
      updateData = { ...req.body }
    }

    // Validation des données si elles sont fournies
    if (updateData.year) {
      const currentYear = new Date().getFullYear()
      if (updateData.year < 1000 || updateData.year > currentYear) {
        return res.status(400).json({
          message: 'Année invalide',
        })
      }
      updateData.year = parseInt(updateData.year)
    }

    // Gestion de la nouvelle image
    if (req.file) {
      try {
        const optimizedPath = await optimizeImage(req.file.path)
        const fileName = path.basename(optimizedPath)
        updateData.imageUrl = `${req.protocol}://${req.get(
          'host'
        )}/images/${fileName}`

        // Supprimer l'ancienne image si elle existe
        if (book.imageUrl) {
          const oldImagePath = path.join(
            __dirname,
            '..',
            'images',
            path.basename(book.imageUrl)
          )
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
          }
        }

        // Supprimer le fichier original après optimisation
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path)
        }
      } catch (imageError) {
        console.error("Erreur lors de l'optimisation de l'image:", imageError)
        return res.status(500).json({
          message: "Erreur lors du traitement de l'image",
        })
      }
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    )

    res.status(200).json({
      message: 'Livre modifié avec succès',
      book: updatedBook,
    })
  } catch (error) {
    console.error('Erreur lors de la modification du livre:', error)
    res.status(500).json({
      message: 'Erreur lors de la modification du livre',
    })
  }
}

// DELETE BOOK - Supprimer un livre (protégé + propriétaire uniquement)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)

    if (!book) {
      return res.status(404).json({
        message: 'Livre non trouvé',
      })
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({
        message: 'Action non autorisée',
      })
    }

    // Supprimer l'image associée si elle existe
    if (book.imageUrl) {
      const imagePath = path.join(
        __dirname,
        '..',
        'images',
        path.basename(book.imageUrl)
      )
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await Book.findByIdAndDelete(req.params.id)
    res.status(200).json({
      message: 'Livre supprimé avec succès',
    })
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error)
    res.status(500).json({
      message: 'Erreur lors de la suppression du livre',
    })
  }
}

// RATE BOOK - Noter un livre (protégé)
exports.rateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    if (!book) {
      return res.status(404).json({
        message: 'Livre non trouvé',
      })
    }

    const userId = req.auth.userId
    const { grade } = req.body

    // Validation de la note
    if (grade === undefined || grade === null) {
      return res.status(400).json({
        message: 'La note est requise',
      })
    }

    if (!Number.isInteger(grade) || grade < 0 || grade > 5) {
      return res.status(400).json({
        message: 'La note doit être un entier entre 0 et 5',
      })
    }

    // Vérifier si l'utilisateur a déjà noté ce livre
    const alreadyRated = book.ratings.find((rating) => rating.userId === userId)
    if (alreadyRated) {
      return res.status(400).json({
        message: 'Vous avez déjà noté ce livre',
      })
    }

    // Ajouter la nouvelle note
    book.ratings.push({ userId, grade })

    // Recalculer la moyenne
    const total = book.ratings.reduce((sum, rating) => sum + rating.grade, 0)
    book.averageRating = Math.round((total / book.ratings.length) * 100) / 100

    await book.save()

    res.status(200).json({
      message: 'Note ajoutée avec succès',
      book,
    })
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error)
    res.status(500).json({
      message: "Erreur lors de l'ajout de la note",
    })
  }
}
