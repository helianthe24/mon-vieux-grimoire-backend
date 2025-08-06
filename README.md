# Mon Vieux Grimoire - Backend API

## 📚 Description

Backend API pour le site "Mon Vieux Grimoire", une plateforme de notation et de référencement de livres.

Cette API RESTful permet aux utilisateurs de :

- S'inscrire et se connecter de manière sécurisée
- Ajouter, modifier et supprimer des livres
- Noter les livres (système de notation sur 5 étoiles)
- Consulter les livres et leurs notes moyennes
- Optimiser automatiquement les images uploadées (Green Code)

## 🛠️ Technologies Utilisées

- **Node.js** - Environnement d'exécution JavaScript
- **Express.js** - Framework web pour Node.js
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification par tokens
- **bcrypt** - Hachage des mots de passe
- **Multer** - Gestion des uploads de fichiers
- **Sharp** - Optimisation et compression d'images
- **dotenv** - Gestion des variables d'environnement

## 🏗️ Architecture

Le projet suit l'architecture **MVC (Modèle-Vue-Contrôleur)** :

```
├── controllers/          # Logique métier
│   ├── authController.js
│   └── bookController.js
├── middlewares/          # Middlewares personnalisés
│   ├── auth.js
│   ├── errorHandler.js
│   └── multer-config.js
├── models/              # Modèles de données
│   ├── Book.js
│   └── User.js
├── routes/              # Définition des routes
│   ├── authRoutes.js
│   └── bookRoutes.js
├── utils/               # Utilitaires
│   ├── image-optimizer.js
│   └── validators.js
├── images/              # Stockage des images
└── server.js           # Point d'entrée de l'application
```

## 🚀 Installation et Configuration

### Prérequis

- Node.js (version 14 ou supérieure)
- MongoDB (local ou Atlas)
- npm ou yarn

### Installation

1. **Cloner le repository**

```bash
git clone https://github.com/votre-username/mon-vieux-grimoire-backend.git
cd mon-vieux-grimoire-backend
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration des variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
# Configuration du serveur
PORT=4000
NODE_ENV=development

# Configuration de la base de données MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/mon-vieux-grimoire

# Configuration JWT
JWT_SECRET=votre_secret_jwt_très_sécurisé

# Configuration des uploads
MAX_FILE_SIZE=5242880
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp

# Configuration des images
IMAGE_QUALITY=80
IMAGE_MAX_WIDTH=800
```

4. **Démarrer MongoDB**

```bash
# Si MongoDB est installé localement
mongod
```

5. **Lancer l'application**

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

L'API sera accessible sur `http://localhost:4000`

## 📋 API Endpoints

### Authentification

| Méthode | Endpoint           | Description             | Auth requise |
| ------- | ------------------ | ----------------------- | ------------ |
| POST    | `/api/auth/signup` | Inscription utilisateur | Non          |
| POST    | `/api/auth/login`  | Connexion utilisateur   | Non          |

### Livres

| Méthode | Endpoint                | Description                      | Auth requise       |
| ------- | ----------------------- | -------------------------------- | ------------------ |
| GET     | `/api/books`            | Récupérer tous les livres        | Non                |
| GET     | `/api/books/bestrating` | Top 3 des livres les mieux notés | Non                |
| GET     | `/api/books/:id`        | Récupérer un livre par ID        | Non                |
| POST    | `/api/books`            | Créer un nouveau livre           | Oui                |
| PUT     | `/api/books/:id`        | Modifier un livre                | Oui (propriétaire) |
| DELETE  | `/api/books/:id`        | Supprimer un livre               | Oui (propriétaire) |
| POST    | `/api/books/:id/rating` | Noter un livre                   | Oui                |

### Utilitaires

| Méthode | Endpoint      | Description                     |
| ------- | ------------- | ------------------------------- |
| GET     | `/`           | Page d'accueil de l'API         |
| GET     | `/api/health` | Vérification de l'état de l'API |

## 📝 Exemples d'utilisation

### Inscription

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123"
  }'
```

### Connexion

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "motdepasse123"
  }'
```

### Créer un livre

```bash
curl -X POST http://localhost:4000/api/books \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Le Seigneur des Anneaux" \
  -F "author=J.R.R. Tolkien" \
  -F "year=1954" \
  -F "genre=Fantasy" \
  -F "image=@/path/to/image.jpg"
```

### Noter un livre

```bash
curl -X POST http://localhost:4000/api/books/BOOK_ID/rating \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 5
  }'
```

## 🔒 Sécurité

- **Authentification JWT** : Tokens sécurisés avec expiration
- **Hachage des mots de passe** : bcrypt avec salt rounds
- **Validation des données** : Validation stricte des entrées utilisateur
- **CORS configuré** : Gestion des requêtes cross-origin
- **Gestion d'erreurs centralisée** : Middleware de gestion d'erreurs
- **Limitation des uploads** : Taille et types de fichiers contrôlés

## 🌱 Green Code - Optimisation des Images

L'application respecte les bonnes pratiques du Green Code :

- **Compression automatique** : Conversion en WebP avec qualité optimisée
- **Redimensionnement intelligent** : Largeur maximale de 800px
- **Suppression des fichiers temporaires** : Nettoyage automatique
- **Optimisation des métadonnées** : Suppression des données EXIF

---

**Note** : Ce projet a été développé dans le cadre de la formation OpenClassrooms "Développeur Web".
