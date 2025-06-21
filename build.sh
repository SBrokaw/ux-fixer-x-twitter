#!/bin/bash

# X.com UX Fixer - Build Script
# Packages the Firefox extension for testing

echo "Building X.com UX Fixer extension..."

# Create build directory
mkdir -p build

# Copy extension files
cp manifest.json build/
cp -r scripts/ build/
cp -r styles/ build/
cp -r icons/ build/

# Create zip file for Firefox
cd build
zip -r ../x-twitter-home-extension.zip .

echo "Extension built successfully!"
echo "File: x-twitter-home-extension.zip"
echo ""
echo "To install in Firefox:"
echo "1. Open Firefox"
echo "2. Go to about:debugging"
echo "3. Click 'This Firefox'"
echo "4. Click 'Load Temporary Add-on'"
echo "5. Select the manifest.json file from the build/ directory" 