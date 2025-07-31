const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  imageUrl: { type: String, required: false }, // on ajoutera Multer + Sharp plus tard
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, default: 0 },
  userId: { type: String, required: true }, // créateur du livre
})

module.exports = mongoose.model('Book', bookSchema)
