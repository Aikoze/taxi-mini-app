# Configuration des variables d'environnement sur Vercel

Pour que votre application fonctionne correctement sur Vercel, vous devez configurer les variables d'environnement suivantes :

## Variables d'environnement requises

### Variables pour l'API (backend)
- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_KEY` : Clé de service (service_role) Supabase
- `TELEGRAM_BOT_TOKEN` : Token du bot Telegram

### Variables pour le frontend
- `VITE_SUPABASE_URL` : URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : Clé anonyme (anon key) Supabase
- `VITE_TELEGRAM_BOT` : Token du bot Telegram
- `VITE_API_URL` : URL de l'API (vide ou `/api` pour utiliser les fonctions serverless)

## Comment configurer les variables d'environnement sur Vercel

1. Connectez-vous à votre tableau de bord Vercel
2. Sélectionnez votre projet "taxi-mini-app"
3. Allez dans "Settings" > "Environment Variables"
4. Ajoutez chaque variable d'environnement avec sa valeur correspondante
5. Assurez-vous de sélectionner les environnements appropriés (Production, Preview, Development)
6. Cliquez sur "Save" pour enregistrer vos modifications

## Vérifier la configuration

Après avoir configuré les variables d'environnement, vous pouvez visiter l'URL suivante pour vérifier quelles variables sont correctement définies :

```
https://taxi-mini-app.vercel.app/api/debug
```

Cette page affichera un résumé des variables d'environnement disponibles dans votre déploiement, sans exposer les valeurs sensibles.

## Problèmes courants

- Si vous voyez l'erreur "supabaseUrl is required", cela signifie que la variable `SUPABASE_URL` n'est pas correctement définie.
- Pour les fonctions serverless, les variables d'environnement doivent être définies dans les paramètres du projet Vercel, pas seulement dans des fichiers `.env` locaux.
- Après avoir mis à jour les variables d'environnement, vous devrez redéployer votre application pour que les changements prennent effet.
