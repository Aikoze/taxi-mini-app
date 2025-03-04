# Guide de déploiement sur Vercel

Ce guide explique comment déployer l'application Taxi Mini App sur Vercel.

## Prérequis

- Compte Vercel (https://vercel.com)
- Vercel CLI installé localement (`npm i -g vercel`)
- Variables d'environnement nécessaires

## Configuration des variables d'environnement

Avant le déploiement, assurez-vous de configurer les variables d'environnement suivantes dans votre projet Vercel :

### Frontend (Variables d'environnement exposées au navigateur)
- `VITE_SUPABASE_URL`: URL de votre projet Supabase
- `VITE_SUPABASE_KEY`: Clé publique Supabase (anon key)
- `VITE_API_URL`: URL de l'API (vide pour utiliser le même domaine)

### Backend (Variables d'environnement serveur)
- `SUPABASE_URL`: URL de votre projet Supabase
- `SUPABASE_KEY`: Clé de service Supabase (service_role key)
- `TELEGRAM_BOT_TOKEN`: Token du bot Telegram

## Étapes de déploiement

1. **Authentification locale à Vercel (première fois uniquement)**
   ```
   vercel login
   ```

2. **Déploiement en environnement de développement**
   ```
   npm run deploy:dev
   ```
   Cela déploiera l'application sur une URL de prévisualisation.

3. **Déploiement en production**
   ```
   npm run deploy
   ```
   Cela déploiera l'application sur votre domaine de production.

## Structure du déploiement

- Le frontend (React) est déployé en tant que site statique dans le dossier `dist`
- Le backend (Express.js) est déployé en tant que fonctions serverless dans le dossier `api`
- Les routes API sont accessibles via `/api/*`

## Débogage

Si vous rencontrez des problèmes avec le déploiement :

1. Vérifiez les logs de déploiement dans le tableau de bord Vercel
2. Assurez-vous que toutes les variables d'environnement sont correctement configurées
3. Vérifiez que les permissions Supabase sont correctement configurées

## Domaine personnalisé (optionnel)

Pour configurer un domaine personnalisé :

1. Allez dans les paramètres de votre projet sur Vercel
2. Accédez à la section "Domains"
3. Ajoutez votre domaine et suivez les instructions pour configurer les enregistrements DNS
