#!/usr/bin/env bash
set -euo pipefail

# Small delay to ensure Capacitor finished generating files
sleep 2

# Determine Gradle build file (Groovy or Kotlin DSL)
if [ -f "android/app/build.gradle" ]; then
  TARGET_FILE="android/app/build.gradle"
  DSL="groovy"
elif [ -f "android/app/build.gradle.kts" ]; then
  TARGET_FILE="android/app/build.gradle.kts"
  DSL="kts"
else
  echo "No standard Gradle build file found. Checking for Capacitor 7 structure..."
  # For Capacitor 7, the build file might be generated differently
  find android -name "*.gradle*" -type f || true

  if [ ! -d "android/app" ]; then
    echo "Error: android/app directory not found"
    exit 1
  fi

  echo "Creating basic build.gradle for signing configuration..."
  cat > android/app/build.gradle << 'EOFBUILD'
apply plugin: 'com.android.application'

android {
    namespace "app.dakk.lafleche"
    compileSdkVersion rootProject.ext.compileSdkVersion
    defaultConfig {
        applicationId "app.dakk.lafleche"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation project(':capacitor-android')
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'
EOFBUILD

  TARGET_FILE="android/app/build.gradle"
  DSL="groovy"
fi

# Backup original
cp "$TARGET_FILE" "$TARGET_FILE.bak"

# Add signing prelude at the beginning (per DSL)
if [ "$DSL" = "groovy" ]; then
  cat > /tmp/signing.prelude << 'EOFGRADLE'
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
EOFGRADLE
else
  cat > /tmp/signing.prelude << 'EOFKTS'
val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = java.util.Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(java.io.FileInputStream(keystorePropertiesFile))
}
EOFKTS
fi

cat /tmp/signing.prelude "$TARGET_FILE" > /tmp/build.gradle.new
mv /tmp/build.gradle.new "$TARGET_FILE"

# Add signing configs inside android block (per DSL)
if [ "$DSL" = "groovy" ]; then
  awk '/android \{/ {print; print "    signingConfigs {"; print "        release {"; print "            if (keystorePropertiesFile.exists()) {"; print "                keyAlias keystoreProperties[\"keyAlias\"]"; print "                keyPassword keystoreProperties[\"keyPassword\"]"; print "                storeFile file(keystoreProperties[\"storeFile\"])"; print "                storePassword keystoreProperties[\"storePassword\"]"; print "            }"; print "        }"; print "    }"; next} 1' "$TARGET_FILE" > /tmp/build.gradle.new
else
  awk '/android \{/ {print; print "    signingConfigs {"; print "        create(\"release\") {"; print "            if (keystorePropertiesFile.exists()) {"; print "                keyAlias = keystoreProperties[\"keyAlias\"] as String"; print "                keyPassword = keystoreProperties[\"keyPassword\"] as String"; print "                storeFile = file(keystoreProperties[\"storeFile\"] as String)"; print "                storePassword = keystoreProperties[\"storePassword\"] as String"; print "            }"; print "        }"; print "    }"; next} 1' "$TARGET_FILE" > /tmp/build.gradle.new
fi
mv /tmp/build.gradle.new "$TARGET_FILE"

# Update buildTypes release to use signingConfig and enable minification (per DSL)
if [ "$DSL" = "groovy" ]; then
  awk '/buildTypes \{/ {inBuildTypes=1} inBuildTypes && /release \{/ && !done {print; print "            signingConfig signingConfigs.release"; print "            minifyEnabled true"; print "            shrinkResources true"; print "            proguardFiles getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\""; done=1; next} {print}' "$TARGET_FILE" > /tmp/build.gradle.new
else
  awk '/buildTypes \{/ {inBuildTypes=1} inBuildTypes && /release \{/ && !done {print; print "            signingConfig = signingConfigs.getByName(\"release\")"; print "            isMinifyEnabled = true"; print "            isShrinkResources = true"; print "            proguardFiles(getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\")"; done=1; next} {print}' "$TARGET_FILE" > /tmp/build.gradle.new
fi
mv /tmp/build.gradle.new "$TARGET_FILE"
