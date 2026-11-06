# AlbumsRating

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vuedotjs&logoColor=4FC08D)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)
![Vue Router](https://img.shields.io/badge/Vue_Router-35495E?logo=vuedotjs&logoColor=4FC08D)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)
![Spotify](https://img.shields.io/badge/Spotify_API-1DB954?logo=spotify&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

AlbumsRating est une bibliothèque musicale personnelle : on y garde ses avis sur les albums qu'on écoute, titre par titre, puis on explore ses goûts à travers des statistiques.

Ce n'est ni un réseau social, ni un outil de découverte musicale. Chaque album devient une fiche personnelle avec les notes et commentaires de chaque morceau, un avis global, les titres préférés et les moins aimés. Au fil du temps, ça forme un carnet musical qui garde la mémoire de sa discothèque.

Ce dépôt contient la version web. Des applications Android et iOS sont prévues et réutiliseront le même backend Supabase.

**Démo : [albumsrating-web.vercel.app](https://albumsrating-web.vercel.app)**

## Fonctionnalités

- Collection : recherche d'albums via Spotify (par une Edge Function Supabase), ajout à sa collection, filtrage
- Notation : une note de 1 à 5 par titre, avec commentaire facultatif par titre et pour l'album, plus son morceau préféré et celui qu'on aime le moins
- Statistiques : note moyenne et répartition des notes par album, tops (albums, artistes), albums les plus homogènes ou irréguliers, Hall of Fame

## Stack technique

| Outil | Rôle |
| --- | --- |
| Vue 3 | Framework principal |
| Pinia | Gestion de l'état |
| Vue Router | Navigation entre les vues |
| Tailwind CSS | Mise en forme |
| Supabase | Base de données, authentification Google, règles RLS, Edge Functions |
| API Spotify | Source des données des albums, jamais appelée directement par le front |
| Vercel | Hébergement du front |

Il n'y a pas de serveur à part : Supabase gère les données et l'authentification, et c'est aussi lui qui communique avec Spotify. Le front appelle des Edge Functions Supabase, qui interrogent l'API Spotify à sa place. Les identifiants Spotify restent donc côté serveur, jamais exposés dans le navigateur.

## Installation

Il faut avoir [Node.js](https://nodejs.org/) installé, ainsi qu'un compte [Supabase](https://supabase.com/) et une application [Spotify for Developers](https://developer.spotify.com/).

**1. Cloner le dépôt**

```bash
git clone https://github.com/xisxis13/albumsrating-web.git
cd albumsrating-web
```

**2. Installer les dépendances**

```bash
npm install
```

**3. Configurer Supabase**

- Créer un projet Supabase
- Mettre en place le schéma de la base de données et les règles RLS
- Activer l'authentification Google
- Déployer les Edge Functions et y renseigner les identifiants Spotify (client ID et secret) comme secrets

**4. Renseigner les variables d'environnement**

Créer un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

**5. Lancer l'application**

```bash
npm run dev
```

## Applications mobiles

Des versions Android et iOS sont prévues. Elles s'appuieront sur le même backend Supabase, donc sur les mêmes comptes et les mêmes données que la version web.

## Auteur

Alexis Ravasco, étudiant en dernière année de bachelier en développement d'applications, HELHa Mons.