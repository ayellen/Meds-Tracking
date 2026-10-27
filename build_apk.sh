#!/usr/bin/env bash
set -e

echo "=== Building Production Web Bundle ==="
npm run build

ANDROID_DIR="$(pwd)/android"
SDK_DIR="/opt/android-sdk"
BUILD_TOOLS="$SDK_DIR/build-tools/34.0.0"
PLATFORM="$SDK_DIR/platforms/android-35/android.jar"

mkdir -p "$ANDROID_DIR/gen" "$ANDROID_DIR/obj" "$ANDROID_DIR/bin" "$ANDROID_DIR/assets" "$ANDROID_DIR/output"
mkdir -p public

echo "=== Syncing Web Assets to Android Assets ==="
rm -rf "$ANDROID_DIR/assets"/*
cp dist/index.html "$ANDROID_DIR/assets/"
cp -r dist/assets "$ANDROID_DIR/assets/"

echo "=== Compiling Android Resources with aapt2 ==="
"$BUILD_TOOLS/aapt2" compile --dir "$ANDROID_DIR/res" -o "$ANDROID_DIR/compiled_res.zip"

echo "=== Linking APK with aapt2 ==="
"$BUILD_TOOLS/aapt2" link \
    -I "$PLATFORM" \
    "$ANDROID_DIR/compiled_res.zip" \
    --manifest "$ANDROID_DIR/AndroidManifest.xml" \
    --java "$ANDROID_DIR/gen" \
    -o "$ANDROID_DIR/app.unsigned.apk" \
    -A "$ANDROID_DIR/assets"

echo "=== Compiling Java Source Files ==="
javac -cp "$PLATFORM" -d "$ANDROID_DIR/obj" \
    "$ANDROID_DIR/gen/com/wearos/medlogger/R.java" \
    "$ANDROID_DIR/src/com/wearos/medlogger/MainActivity.java"

echo "=== Converting Class Files to DEX with d8 ==="
"$BUILD_TOOLS/d8" \
    --output "$ANDROID_DIR/bin" \
    "$ANDROID_DIR/obj/com/wearos/medlogger"/*.class \
    --lib "$PLATFORM"

echo "=== Adding classes.dex to APK ==="
cd "$ANDROID_DIR/bin"
zip -uj "$ANDROID_DIR/app.unsigned.apk" classes.dex
cd - > /dev/null

echo "=== Zipaligning APK ==="
rm -f "$ANDROID_DIR/app.aligned.apk"
zipalign -v -p 4 "$ANDROID_DIR/app.unsigned.apk" "$ANDROID_DIR/app.aligned.apk"

echo "=== Generating Debug Keystore if needed ==="
if [ ! -f "$ANDROID_DIR/debug.keystore" ]; then
    keytool -genkeypair -v \
        -keystore "$ANDROID_DIR/debug.keystore" \
        -storepass android \
        -alias androiddebugkey \
        -keypass android \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=WearOS MedLogger,O=WearOS,C=US"
fi

APK_TARGET="$(pwd)/public/WearOS-Medication-Logger.apk"

echo "=== Signing APK with apksigner ==="
apksigner sign \
    --ks "$ANDROID_DIR/debug.keystore" \
    --ks-pass pass:android \
    --ks-key-alias androiddebugkey \
    --key-pass pass:android \
    --out "$APK_TARGET" \
    "$ANDROID_DIR/app.aligned.apk"

echo "=== Verifying Signed APK ==="
apksigner verify "$APK_TARGET"

cp "$APK_TARGET" "$ANDROID_DIR/output/WearOS-Medication-Logger.apk"

echo "=== BUILD SUCCESSFUL ==="
ls -lh "$APK_TARGET"
