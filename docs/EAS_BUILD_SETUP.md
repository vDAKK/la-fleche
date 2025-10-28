# Configuration EAS Build pour flight-point-master

EAS Build (Expo Application Services) permet de construire votre app iOS et Android dans le cloud, **sans avoir besoin d'un Mac ou de Xcode installé localement**.

## 🎯 Avantages d'EAS Build

- ✅ **Pas besoin de Mac** pour builder iOS
- ✅ **Pas besoin de Xcode** installé localement
- ✅ Builds dans le cloud
- ✅ Configuration simplifiée
- ✅ **Plan gratuit disponible** avec limitations
- ✅ Parfait pour débuter avant d'avoir un compte Apple Developer

## 📋 Prérequis

1. **Compte Expo** (gratuit)
   - Créer un compte sur [expo.dev](https://expo.dev)
   
2. **Installation EAS CLI** (sur votre machine locale)
   ```bash
   npm install -g eas-cli
   ```

3. **Se connecter à Expo**
   ```bash
   eas login
   ```

## 🚀 Configuration initiale

### 1. Initialiser Capacitor (si pas déjà fait)

```bash
# Cloner le repo GitHub
git clone <votre-repo-url>
cd flight-point-master

# Installer les dépendances
npm install

# Ajouter les plateformes
npx cap add ios
npx cap add android

# Build le projet web
npm run build

# Synchroniser avec Capacitor
npx cap sync
```

### 2. Configurer EAS

Le fichier `eas.json` est déjà configuré avec 3 profils :

- **development** : Pour le développement (APK Android, Simulator iOS)
- **preview** : Pour les tests internes (APK Android, build iOS sans App Store)
- **production** : Pour la production

### 3. Configurer les identifiants de l'app

Dans `capacitor.config.ts`, vérifiez :
```typescript
appId: 'app.lovable.63388a6310ac40b691afdcee1bd8ff6f'
appName: 'flight-point-master'
```

## 📱 Construire votre app

### Build Android (APK)

```bash
# Build de preview (recommandé pour commencer)
eas build --platform android --profile preview

# Build de production
eas build --platform android --profile production
```

Vous recevrez un lien pour télécharger l'APK une fois le build terminé.

### Build iOS (sans compte Apple Developer)

```bash
# Build de preview
eas build --platform ios --profile preview
```

⚠️ **Important pour iOS** :
- Sans compte Apple Developer ($99/an), vous pouvez créer des builds pour **simulateur uniquement**
- Pour installer sur un vrai iPhone, vous aurez besoin d'un compte Apple Developer
- Le profil `preview` crée un build qui peut être testé via TestFlight (nécessite compte Apple Developer)

### Build les deux plateformes

```bash
eas build --platform all --profile preview
```

## 🤖 Automatisation avec GitHub Actions

Un workflow GitHub Actions est disponible : `.github/workflows/eas-build.yml`

### Configuration du secret EXPO_TOKEN

1. Générer un token Expo :
   ```bash
   eas token:create
   ```

2. Ajouter le token dans GitHub :
   - Aller dans **Settings** → **Secrets and variables** → **Actions**
   - Créer un nouveau secret : `EXPO_TOKEN`
   - Coller le token généré

### Déclencher un build depuis GitHub

1. Aller dans l'onglet **Actions** de votre repo GitHub
2. Sélectionner le workflow **EAS Build**
3. Cliquer sur **Run workflow**
4. Choisir :
   - Platform : `android`, `ios`, ou `all`
   - Profile : `development`, `preview`, ou `production`

## 💰 Tarification EAS Build

### Plan gratuit
- **Android** : Builds illimités
- **iOS** : 30 builds par mois (sans compte Apple Developer, simulateur uniquement)

### Plans payants
- À partir de $29/mois pour plus de builds iOS
- Voir [expo.dev/pricing](https://expo.dev/pricing)

## 📦 Distribuer votre app

### Android

1. **APK direct** : Téléchargez l'APK depuis EAS et partagez-le
2. **Google Play Store** :
   - Créer un compte Google Play Console ($25 unique)
   - Configurer `eas submit` avec votre compte
   ```bash
   eas submit --platform android --profile production
   ```

### iOS

1. **TestFlight** : Nécessite un compte Apple Developer
   ```bash
   eas submit --platform ios --profile production
   ```

2. **App Store** : Après validation sur TestFlight

## 🔧 Commandes utiles

```bash
# Voir l'état de vos builds
eas build:list

# Voir les détails d'un build spécifique
eas build:view <build-id>

# Annuler un build en cours
eas build:cancel

# Configurer les credentials iOS/Android
eas credentials

# Soumettre à l'App Store / Play Store
eas submit
```

## 🆘 Prochaines étapes

1. **Créer un compte Expo** sur [expo.dev](https://expo.dev)
2. **Installer EAS CLI** : `npm install -g eas-cli`
3. **Lancer votre premier build Android** : `eas build --platform android --profile preview`
4. **Tester l'APK** sur votre téléphone Android
5. Quand vous serez prêt pour iOS, considérer un **compte Apple Developer** ($99/an)

## 📚 Documentation

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Capacitor avec EAS](https://capacitorjs.com/docs/guides/deploying-updates)
- [Guide de soumission](https://docs.expo.dev/submit/introduction/)
