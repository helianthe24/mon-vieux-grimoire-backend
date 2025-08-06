// Utilitaires de validation

// Validation d'email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validation de mot de passe
const isValidPassword = (password) => {
  return password && password.length >= 6
}

// Validation d'année
const isValidYear = (year) => {
  const currentYear = new Date().getFullYear()
  const numYear = parseInt(year)
  return numYear >= 1000 && numYear <= currentYear
}

// Validation de note (rating)
const isValidRating = (grade) => {
  return Number.isInteger(grade) && grade >= 0 && grade <= 5
}

// Validation des champs requis pour un livre
const validateBookData = (bookData) => {
  const { title, author, year, genre } = bookData
  const errors = []

  if (!title || title.trim().length === 0) {
    errors.push('Le titre est requis')
  }

  if (!author || author.trim().length === 0) {
    errors.push("L'auteur est requis")
  }

  if (!year) {
    errors.push("L'année est requise")
  } else if (!isValidYear(year)) {
    errors.push("L'année doit être comprise entre 1000 et l'année actuelle")
  }

  if (!genre || genre.trim().length === 0) {
    errors.push('Le genre est requis')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Validation des données d'authentification
const validateAuthData = (authData) => {
  const { email, password } = authData
  const errors = []

  if (!email || email.trim().length === 0) {
    errors.push("L'email est requis")
  } else if (!isValidEmail(email)) {
    errors.push("Format d'email invalide")
  }

  if (!password || password.trim().length === 0) {
    errors.push('Le mot de passe est requis')
  } else if (!isValidPassword(password)) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Sanitisation des données (suppression des espaces en début/fin)
const sanitizeString = (str) => {
  return typeof str === 'string' ? str.trim() : str
}

const sanitizeBookData = (bookData) => {
  return {
    ...bookData,
    title: sanitizeString(bookData.title),
    author: sanitizeString(bookData.author),
    genre: sanitizeString(bookData.genre),
    year: bookData.year ? parseInt(bookData.year) : bookData.year,
  }
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidYear,
  isValidRating,
  validateBookData,
  validateAuthData,
  sanitizeString,
  sanitizeBookData,
}
