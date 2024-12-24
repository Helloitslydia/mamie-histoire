# Documentation Supabase - MamieVouziersHistoires

## Structure de la base de données

### Table `histoires`

Cette table stocke les mémos vocaux avec les champs suivants :

- `id` : Identifiant unique UUID
- `title` : Titre du mémo vocal
- `audio_url` : URL de stockage du fichier audio
- `duration` : Durée en secondes
- `created_at` : Date de création
- `updated_at` : Date de dernière modification
- `description` : Description optionnelle
- `tags` : Tags pour catégoriser les mémos

## Architecture des services

Le code Supabase est organisé en deux parties principales :

### `/src/lib/services/supabase/client`
Contient le code qui s'exécute côté client :
- Configuration du client Supabase
- Hooks personnalisés pour l'interaction avec Supabase
- Fonctions d'upload des fichiers audio

### `/src/lib/services/supabase/server`
Contient le code qui s'exécute côté serveur :
- Configuration du client Supabase côté serveur
- Middleware d'authentification
- Fonctions d'API sécurisées

## Sécurité

- Row Level Security (RLS) est activé sur la table `histoires`
- Les politiques de sécurité permettent :
  - La lecture publique des mémos
  - L'insertion et la modification uniquement pour les utilisateurs authentifiés

## Variables d'environnement requises

```env
NEXT_PUBLIC_SUPABASE_URL=https://pxcbbtqneuyvxheobyfz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

## Migrations

Les migrations sont stockées dans le dossier `/migrations` et doivent être exécutées dans l'ordre numérique.
Pour appliquer une nouvelle migration :

1. Connectez-vous à la console Supabase
2. Allez dans l'éditeur SQL
3. Copiez et exécutez le contenu du fichier de migration
