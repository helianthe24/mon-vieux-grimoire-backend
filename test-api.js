// Script de test simple pour vérifier l'API
const axios = require('axios')

const BASE_URL = 'http://localhost:4000'

async function testAPI() {
  console.log("🧪 Test de l'API Mon Vieux Grimoire\n")

  try {
    // Test 1: Vérifier que l'API répond
    console.log("1. Test de connexion à l'API...")
    const healthResponse = await axios.get(`${BASE_URL}/`)
    console.log('✅ API accessible:', healthResponse.data.message)

    // Test 2: Vérifier la route health
    console.log('\n2. Test de la route health...')
    const healthCheck = await axios.get(`${BASE_URL}/api/health`)
    console.log('✅ Health check:', healthCheck.data)

    // Test 3: Récupérer tous les livres (devrait être vide au début)
    console.log('\n3. Test récupération des livres...')
    const booksResponse = await axios.get(`${BASE_URL}/api/books`)
    console.log('✅ Livres récupérés:', booksResponse.data.length, 'livre(s)')

    // Test 4: Test inscription
    console.log('\n4. Test inscription utilisateur...')
    const signupData = {
      email: `test${Date.now()}@example.com`,
      password: 'motdepasse123',
    }

    try {
      const signupResponse = await axios.post(
        `${BASE_URL}/api/auth/signup`,
        signupData
      )
      console.log('✅ Inscription réussie:', signupResponse.data.message)

      // Test 5: Test connexion
      console.log('\n5. Test connexion utilisateur...')
      const loginResponse = await axios.post(
        `${BASE_URL}/api/auth/login`,
        signupData
      )
      console.log('✅ Connexion réussie:', loginResponse.data.message)

      const token = loginResponse.data.token
      console.log('✅ Token JWT reçu')

      // Test 6: Test route protégée (créer un livre sans image)
      console.log("\n6. Test création d'un livre...")
      const bookData = {
        title: 'Livre de Test',
        author: 'Auteur Test',
        year: 2024,
        genre: 'Test',
      }

      const createBookResponse = await axios.post(
        `${BASE_URL}/api/books`,
        bookData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('✅ Livre créé:', createBookResponse.data.book.title)

      const bookId = createBookResponse.data.book._id

      // Test 7: Test notation du livre
      console.log('\n7. Test notation du livre...')
      const ratingData = { grade: 4 }
      const ratingResponse = await axios.post(
        `${BASE_URL}/api/books/${bookId}/rating`,
        ratingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      console.log('✅ Note ajoutée:', ratingResponse.data.book.averageRating)

      // Test 8: Test récupération du livre
      console.log('\n8. Test récupération du livre créé...')
      const getBookResponse = await axios.get(`${BASE_URL}/api/books/${bookId}`)
      console.log('✅ Livre récupéré:', getBookResponse.data.title)

      console.log('\n🎉 Tous les tests sont passés avec succès !')
    } catch (authError) {
      if (
        authError.response?.status === 400 &&
        authError.response?.data?.message?.includes('existe déjà')
      ) {
        console.log("⚠️ Utilisateur existe déjà, test d'inscription ignoré")
      } else {
        throw authError
      }
    }
  } catch (error) {
    console.error(
      '❌ Erreur lors du test:',
      error.response?.data || error.message
    )
    process.exit(1)
  }
}

// Vérifier si axios est installé
try {
  require('axios')
} catch (error) {
  console.log("📦 Installation d'axios pour les tests...")
  const { execSync } = require('child_process')
  execSync('npm install axios', { stdio: 'inherit' })
}

testAPI()
