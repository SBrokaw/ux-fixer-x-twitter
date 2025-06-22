#!/bin/bash

# X.com UX Fixer - Build Script
# Packages the Firefox extension for testing

echo "Building X.com UX Fixer extension..."

# Clean build directory
rm -rf build
mkdir -p build/scripts build/styles build/icons

# Copy extension files to correct subdirectories
cp manifest.json build/
cp scripts/* build/scripts/
cp styles/* build/styles/
cp icons/* build/icons/

# Remove any misplaced files in build root (should only be manifest.json and subdirs)
find build -maxdepth 1 -type f ! -name 'manifest.json' -exec rm -f {} +

# Create zip file for Firefox
cd build
zip -r ../x-twitter-home-extension.zip .

cd ..
echo "Extension built successfully!"
echo "File: x-twitter-home-extension.zip"
echo ""
echo "To install in Firefox:"
echo "1. Open Firefox"
echo "2. Go to about:debugging"
echo "3. Click 'This Firefox'"
echo "4. Click 'Load Temporary Add-on'"
echo "5. Select the manifest.json file from the build/ directory" 