#!/bin/bash

echo "📱 Generating App Icons from SVG Logo..."
echo ""

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found!"
    echo ""
    echo "Please install ImageMagick first:"
    echo "  brew install imagemagick"
    echo ""
    exit 1
fi

# Set paths
LOGO_PATH="/Users/ashokverma/Documents/TechRover/elora-web/public/logo.svg"
RES_PATH="$(dirname "$0")/../android/app/src/main/res"

# Check if logo exists
if [ ! -f "$LOGO_PATH" ]; then
    echo "❌ Logo file not found at: $LOGO_PATH"
    exit 1
fi

echo "✅ Found logo at: $LOGO_PATH"
echo "✅ Generating icons to: $RES_PATH"
echo ""

# Use magick or convert command
CMD="magick convert"
if ! command -v magick &> /dev/null; then
    CMD="convert"
fi

# Generate icons for each density
declare -A sizes=(
    ["mdpi"]=48
    ["hdpi"]=72
    ["xhdpi"]=96
    ["xxhdpi"]=144
    ["xxxhdpi"]=192
)

for dpi in "${!sizes[@]}"; do
    size=${sizes[$dpi]}
    dir="$RES_PATH/mipmap-$dpi"
    
    echo "Generating ${size}x${size} for $dpi..."
    
    # Generate square icon
    $CMD -background white -resize ${size}x${size} "$LOGO_PATH" "$dir/ic_launcher.png"
    
    # Generate round icon
    $CMD -background white -resize ${size}x${size} "$LOGO_PATH" "$dir/ic_launcher_round.png"
done

echo ""
echo "✅ Icons generated successfully!"
echo ""
echo "Next steps:"
echo "1. Clean and rebuild the app:"
echo "   cd android && ./gradlew clean && cd .."
echo "   bun android"
echo ""
