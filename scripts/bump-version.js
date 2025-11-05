#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Lire le fichier package.json pour obtenir la version de base
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

// Générer un versionCode unique (secondes depuis 2024-01-01) pour éviter les doublons
const baseDate = new Date('2024-01-01T00:00:00Z');
const secondsSinceBase = Math.floor((Date.now() - baseDate.getTime()) / 1000);
const versionCode = secondsSinceBase;

// Lire la version actuelle ou utiliser celle du package.json
let version = packageJson.version || '1.0.0';

// Si la version du package.json est 0.0.0, on commence à 1.0.0
if (version === '0.0.0') {
  version = '1.0.0';
}

// Parse la version pour l'incrémenter (patch version)
const versionParts = version.split('.');
const major = parseInt(versionParts[0]) || 1;
const minor = parseInt(versionParts[1]) || 0;
let patch = parseInt(versionParts[2]) || 0;

// Incrémenter la version patch
patch++;
const newVersion = `${major}.${minor}.${patch}`;

console.log(`📱 Mise à jour des versions mobiles:`);
console.log(`   Version: ${newVersion}`);
console.log(`   Android versionCode: ${versionCode}`);
console.log(`   iOS buildNumber: ${versionCode}`);

// Mettre à jour capacitor.config.ts
const capacitorConfigPath = join(__dirname, '../capacitor.config.ts');
let capacitorConfig = readFileSync(capacitorConfigPath, 'utf8');

// Remplacer les versions Android
capacitorConfig = capacitorConfig.replace(
  /versionCode:\s*\d+/,
  `versionCode: ${versionCode}`
);
capacitorConfig = capacitorConfig.replace(
  /versionName:\s*['"][^'"]*['"]/,
  `versionName: '${newVersion}'`
);

// Remplacer les versions iOS
capacitorConfig = capacitorConfig.replace(
  /buildNumber:\s*['"][^'"]*['"]/,
  `buildNumber: '${versionCode}'`
);
capacitorConfig = capacitorConfig.replace(
  /version:\s*['"][^'"]*['"]/,
  `version: '${newVersion}'`
);

// Écrire le fichier mis à jour
writeFileSync(capacitorConfigPath, capacitorConfig, 'utf8');

// Mise à jour directe d'Android (sécurité pour builds locaux)
const androidGradlePath = join(__dirname, '../android/app/build.gradle');
try {
  if (existsSync(androidGradlePath)) {
    let gradle = readFileSync(androidGradlePath, 'utf8');
    const before = gradle;
    gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
    gradle = gradle.replace(/versionName\s+\"[^\"]*\"/, `versionName "${newVersion}"`);
    if (gradle !== before) {
      writeFileSync(androidGradlePath, gradle, 'utf8');
      console.log('🔧 android/app/build.gradle mis à jour directement.');
    }
  }
} catch (e) {
  console.warn('⚠️ Impossible de mettre à jour android/app/build.gradle:', e.message);
}

console.log('✅ Versions mises à jour avec succès!');
