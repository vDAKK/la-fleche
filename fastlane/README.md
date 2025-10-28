# Configuration Fastlane pour La Flèche

## Prérequis

### Pour Android
1. **Keystore Android** : Créez un keystore pour signer l'application
   ```bash
   keytool -genkey -v -keystore release.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Secrets GitHub à configurer** :
   - `ANDROID_KEYSTORE_BASE64` : Keystore encodé en base64
     ```bash
     base64 -i release.keystore | pbcopy
     ```
   - `ANDROID_KEYSTORE_PASSWORD` : Mot de passe du keystore
   - `ANDROID_KEY_ALIAS` : Alias de la clé
   - `ANDROID_KEY_PASSWORD` : Mot de passe de la clé

3. **Google Play Console** (pour déploiement) :
   - Créez un compte de service dans Google Cloud Console
   - Téléchargez le fichier JSON de la clé
   - Ajoutez-le comme secret : `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

### Pour iOS
1. **Compte Apple Developer** ($99/an)
   - Inscrivez-vous sur https://developer.apple.com

2. **Certificats et profils de provisioning** :
   - Certificat de distribution
   - Profil de provisioning App Store

3. **Secrets GitHub à configurer** :
   - `FASTLANE_USER` : Email Apple Developer
   - `FASTLANE_PASSWORD` : Mot de passe Apple Developer (ou app-specific password)
   - `IOS_CERTIFICATE_BASE64` : Certificat .p12 encodé en base64
   - `IOS_CERTIFICATE_PASSWORD` : Mot de passe du certificat
   - `IOS_PROVISION_PROFILE_BASE64` : Profil de provisioning encodé en base64
   - `MATCH_PASSWORD` : Mot de passe pour Fastlane Match (optionnel)

## Utilisation

### Via GitHub Actions
1. Allez dans l'onglet "Actions" de votre repository GitHub
2. Sélectionnez "Build Mobile Apps"
3. Cliquez sur "Run workflow"
4. Choisissez la plateforme (Android, iOS, ou les deux)

### En local
```bash
# Android
cd android
bundle exec fastlane android build

# iOS (nécessite macOS)
cd ios
bundle exec fastlane ios build
```

## Commandes Fastlane

### Android
- `fastlane android build` : Build APK de release
- `fastlane android beta` : Build et déploie sur Play Store (beta)
- `fastlane android production` : Build et déploie sur Play Store (production)

### iOS
- `fastlane ios build` : Build IPA
- `fastlane ios beta` : Build et déploie sur TestFlight
- `fastlane ios production` : Build et déploie sur App Store

## Configuration Capacitor

Avant le premier build, assurez-vous que Capacitor est configuré :

```bash
# Installer les dépendances
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialiser Capacitor (si pas déjà fait)
npx cap init

# Ajouter les plateformes
npx cap add android
npx cap add ios

# Synchroniser
npm run build
npx cap sync
```

## Dépannage

### Android
- **Erreur de signature** : Vérifiez que les secrets GitHub sont correctement configurés
- **Build échoué** : Vérifiez la version de Java (nécessite Java 17)

### iOS
- **Certificat invalide** : Vérifiez que le certificat n'est pas expiré
- **Provisioning profile** : Assurez-vous que le profil correspond à l'App ID
- **Keychain access** : Les commandes de sécurité macOS sont sensibles

## Ressources
- [Documentation Fastlane](https://docs.fastlane.tools/)
- [Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Capacitor Android](https://capacitorjs.com/docs/android)
