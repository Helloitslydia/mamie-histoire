# Mamie Vouziers - Application d'histoires audio

Cette application permet d'enregistrer et d'écouter des histoires audio.

## Configuration

1. Copiez le fichier `.env.example` en `.env.local`
2. Remplissez les variables d'environnement avec vos valeurs Supabase :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://pxcbbtqneuyvxheobyfz.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
   ```

## Développement

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

## Déploiement sur Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Importez ce projet depuis GitHub
3. Dans les paramètres du projet, ajoutez les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Déployez le projet
