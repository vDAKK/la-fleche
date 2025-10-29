# Guide de Publication sur Google Play Store

## Prérequis

### 1. Compte Google Play Developer
- Créer un compte sur [Google Play Console](https://play.google.com/console)
- Frais unique de 25$ USD

### 2. Générer un Keystore Android

```bash
keytool -genkey -v -keystore la-fleche.keystore -alias la-fleche -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: Conservez précieusement:
- Le fichier `.keystore`
- Le mot de passe du keystore
- Le mot de passe de la clé (alias)
- Ces informations sont irremplaçables!

### 3. Configurer le fichier de signature

Créez le fichier `android/key.properties`:

```properties
storePassword=VOTRE_MOT_DE_PASSE_KEYSTORE
keyPassword=VOTRE_MOT_DE_PASSE_CLE
keyAlias=la-fleche
storeFile=../la-fleche.keystore
```

**⚠️ Ne jamais commiter ce fichier dans Git!** Ajoutez-le à `.gitignore`.

### 4. Modifier `android/app/build.gradle`

Après `npx cap sync`, ajoutez cette configuration au fichier `android/app/build.gradle`:

```gradle
// En haut du fichier, avant android {}
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... configuration existante ...
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

## Générer l'AAB pour Production

### Étape 1: Préparer le projet
```bash
# Cloner depuis GitHub
git clone [VOTRE_REPO]
cd la-fleche

# Installer les dépendances
npm install

# Builder le projet web
npm run build

# Synchroniser avec Capacitor
npx cap sync android
```

### Étape 2: Placer le keystore
```bash
# Copier votre keystore dans le dossier android/
cp /chemin/vers/la-fleche.keystore android/

# Créer le fichier key.properties
nano android/key.properties
```

### Étape 3: Générer l'AAB
```bash
cd android
./gradlew bundleRelease
```

L'AAB sera généré dans: `android/app/build/outputs/bundle/release/app-release.aab`

## Utiliser Fastlane (Automatisation)

### Configuration des secrets pour GitHub Actions

Dans les paramètres de votre repo GitHub, ajoutez:

1. **ANDROID_KEYSTORE_BASE64**
```bash
base64 -i la-fleche.keystore | pbcopy  # macOS
base64 -w 0 la-fleche.keystore         # Linux
```

2. **ANDROID_KEYSTORE_PASSWORD** - Mot de passe du keystore
3. **ANDROID_KEY_ALIAS** - `la-fleche`
4. **ANDROID_KEY_PASSWORD** - Mot de passe de la clé

### Déployer avec Fastlane

```bash
# Build local
fastlane android build

# Déployer en beta (internal testing)
fastlane android beta

# Déployer en production
fastlane android production
```

## Assets requis pour le Play Store

### Icônes et Screenshots
- **Icône haute résolution**: 512x512 PNG
- **Feature Graphic**: 1024x500 PNG
- **Screenshots**: Minimum 2, format phone (16:9 ou 9:16)
- **Capture tablet**: Recommandé

### Informations de l'app
- **Titre**: La Flèche (max 50 caractères)
- **Description courte**: Max 80 caractères
- **Description complète**: Max 4000 caractères
- **Privacy Policy URL**: Obligatoire
- **Catégorie**: Jeux > Sport
- **Classification de contenu**: À compléter

### Politique de confidentialité
Créer une page sur votre site expliquant:
- Quelles données sont collectées
- Comment elles sont utilisées
- Les droits des utilisateurs

## Checklist avant publication

- [ ] Version et versionCode mis à jour dans `capacitor.config.ts`
- [ ] AAB signé généré et testé
- [ ] Tous les assets préparés (icônes, screenshots)
- [ ] Description et titre finalisés
- [ ] Politique de confidentialité publiée
- [ ] Compte Google Play Developer actif
- [ ] Classification de contenu complétée

## Commandes utiles

```bash
# Vérifier la signature de l'AAB
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab

# Incrémenter la version
# Éditer capacitor.config.ts:
# versionCode: 2
# versionName: '1.0.1'

# Nettoyer le build
cd android && ./gradlew clean
```

## Ressources
- [Documentation Capacitor Android](https://capacitorjs.com/docs/android)
- [Guide Google Play Console](https://support.google.com/googleplay/android-developer)
- [Fastlane Android](https://docs.fastlane.tools/getting-started/android/setup/)
