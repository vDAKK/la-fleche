# Génération d'un nouveau Keystore Android

Ce guide explique comment générer un nouveau keystore pour signer votre application Android.

## Prérequis

- Java Development Kit (JDK) installé
- Accès à un terminal

## Option 1 : Utiliser le script automatique (Recommandé)

```bash
# Rendre le script exécutable
chmod +x scripts/generate-keystore.sh

# Exécuter le script
./scripts/generate-keystore.sh
```

Le script vous guidera à travers toutes les étapes et générera automatiquement les valeurs pour vos secrets GitHub.

## Option 2 : Génération manuelle

Si vous préférez générer le keystore manuellement :

```bash
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore la-fleche-release.keystore \
  -alias la-fleche \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Vous serez invité à fournir :
- Un mot de passe pour le keystore
- Un mot de passe pour la clé
- Vos informations (nom, organisation, ville, etc.)

## Configuration des secrets GitHub

Une fois le keystore généré, configurez ces 4 secrets dans GitHub (Settings → Secrets and variables → Actions) :

### 1. ANDROID_KEYSTORE_BASE64
```bash
# Encodez le keystore en base64
base64 -i la-fleche-release.keystore | pbcopy  # macOS
# ou
base64 -i la-fleche-release.keystore           # Linux
```

### 2. ANDROID_KEYSTORE_PASSWORD
Le mot de passe que vous avez défini pour le keystore.

### 3. ANDROID_KEY_PASSWORD
Le mot de passe que vous avez défini pour la clé (souvent identique au keystore password).

### 4. ANDROID_KEY_ALIAS
L'alias de la clé : `la-fleche` (si vous avez utilisé le script ou la commande ci-dessus)

## Sécurité

⚠️ **IMPORTANT** :
- Ne commitez JAMAIS votre keystore dans Git
- Conservez une copie de secours sécurisée de votre keystore
- Notez vos mots de passe dans un gestionnaire de mots de passe sécurisé
- Sans le keystore et les mots de passe, vous ne pourrez plus mettre à jour votre app sur le Play Store

## Utilisation

Une fois les secrets configurés, lancez le workflow "Build Mobile Apps" depuis l'onglet Actions de votre repository GitHub :
1. Allez dans Actions
2. Sélectionnez "Build Mobile Apps"
3. Cliquez sur "Run workflow"
4. Choisissez "android" comme plateforme
5. L'AAB signé sera généré automatiquement

## Vérification du keystore

Pour vérifier les informations de votre keystore :

```bash
keytool -list -v -keystore la-fleche-release.keystore
```
