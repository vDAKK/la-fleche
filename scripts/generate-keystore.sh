#!/bin/bash

# Script to generate Android keystore for La Flèche app

echo "🔑 Génération du keystore Android pour La Flèche"
echo "================================================"
echo ""

# Variables
KEYSTORE_FILE="la-fleche-release.keystore"
KEY_ALIAS="la-fleche"
VALIDITY_DAYS=10000

# Prompt for passwords
read -sp "Entrez le mot de passe du keystore (minimum 6 caractères): " KEYSTORE_PASSWORD
echo ""
read -sp "Confirmez le mot de passe du keystore: " KEYSTORE_PASSWORD_CONFIRM
echo ""

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Les mots de passe ne correspondent pas!"
    exit 1
fi

read -sp "Entrez le mot de passe de la clé (peut être identique au keystore): " KEY_PASSWORD
echo ""
read -sp "Confirmez le mot de passe de la clé: " KEY_PASSWORD_CONFIRM
echo ""

if [ "$KEY_PASSWORD" != "$KEY_PASSWORD_CONFIRM" ]; then
    echo "❌ Les mots de passe ne correspondent pas!"
    exit 1
fi

# Distinguished Name information
echo ""
echo "📋 Informations du certificat:"
read -p "Prénom et Nom: " DNAME_CN
read -p "Unité organisationnelle (ex: Development): " DNAME_OU
read -p "Organisation (ex: La Flèche): " DNAME_O
read -p "Ville: " DNAME_L
read -p "État/Province: " DNAME_ST
read -p "Code pays (FR): " DNAME_C

echo ""
echo "⏳ Génération du keystore en cours..."

# Generate keystore
keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY_DAYS \
  -storepass "$KEYSTORE_PASSWORD" \
  -keypass "$KEY_PASSWORD" \
  -dname "CN=$DNAME_CN, OU=$DNAME_OU, O=$DNAME_O, L=$DNAME_L, ST=$DNAME_ST, C=$DNAME_C"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore généré avec succès: $KEYSTORE_FILE"
    echo ""
    echo "📝 Informations pour les secrets GitHub:"
    echo "========================================"
    echo ""
    echo "ANDROID_KEY_ALIAS=$KEY_ALIAS"
    echo "ANDROID_KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD"
    echo "ANDROID_KEY_PASSWORD=$KEY_PASSWORD"
    echo ""
    echo "Pour ANDROID_KEYSTORE_BASE64, exécutez:"
    echo "base64 -i $KEYSTORE_FILE | pbcopy"
    echo "(le résultat sera copié dans votre presse-papiers)"
    echo ""
    echo "⚠️  IMPORTANT: Conservez ces informations en lieu sûr!"
    echo "⚠️  Ne partagez JAMAIS votre keystore ou vos mots de passe!"
else
    echo "❌ Erreur lors de la génération du keystore"
    exit 1
fi
