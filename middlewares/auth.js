const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization // format: Bearer <token>
    if (!authHeader) return res.status(401).json({ message: 'Token manquant' })

    const token = authHeader.split(' ')[1]
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = { userId: decodedToken.userId }
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' })
  }
}
