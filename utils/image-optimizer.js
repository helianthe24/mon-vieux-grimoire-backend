const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

/**
 * Optimise une image en la redimensionnant et la convertissant en WebP
 * @param {string} filePath - Chemin vers le fichier image original
 * @returns {Promise<string>} - Chemin vers le fichier optimisé
 */
async function optimizeImage(filePath) {
  try {
    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Fichier non trouvé: ${filePath}`)
    }

    // Configuration depuis les variables d'environnement
    const imageQuality = parseInt(process.env.IMAGE_QUALITY) || 80
    const maxWidth = parseInt(process.env.IMAGE_MAX_WIDTH) || 800

    // Générer le chemin du fichier optimisé
    const optimizedPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp')

    // Optimiser l'image
    await sharp(filePath)
      .resize(maxWidth, null, {
        withoutEnlargement: true, // Ne pas agrandir les petites images
        fit: 'inside', // Conserver les proportions
      })
      .webp({
        quality: imageQuality,
        effort: 6, // Niveau de compression (0-6, 6 = meilleur)
      })
      .toFile(optimizedPath)

    // Vérifier que le fichier optimisé a été créé
    if (!fs.existsSync(optimizedPath)) {
      throw new Error('Échec de la création du fichier optimisé')
    }

    console.log(
      `✅ Image optimisée: ${path.basename(filePath)} -> ${path.basename(
        optimizedPath
      )}`
    )

    return optimizedPath
  } catch (error) {
    console.error("❌ Erreur lors de l'optimisation de l'image:", error)

    // Nettoyer les fichiers en cas d'erreur
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath)
      } catch (cleanupError) {
        console.error(
          'Erreur lors du nettoyage du fichier original:',
          cleanupError
        )
      }
    }

    throw new Error(
      `Erreur lors de l'optimisation de l'image: ${error.message}`
    )
  }
}

/**
 * Supprime un fichier image de manière sécurisée
 * @param {string} imagePath - Chemin vers le fichier à supprimer
 */
function deleteImage(imagePath) {
  try {
    if (imagePath && fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath)
      console.log(`🗑️ Image supprimée: ${path.basename(imagePath)}`)
    }
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'image:", error)
  }
}

/**
 * Obtient les informations d'une image
 * @param {string} imagePath - Chemin vers le fichier image
 * @returns {Promise<Object>} - Métadonnées de l'image
 */
async function getImageInfo(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata()
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: fs.statSync(imagePath).size,
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture des métadonnées:', error)
    throw new Error("Impossible de lire les informations de l'image")
  }
}

module.exports = {
  optimizeImage,
  deleteImage,
  getImageInfo,
}
