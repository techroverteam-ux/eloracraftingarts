# Logo Setup Instructions

## Converting SVG to PNG for React Native

Since React Native doesn't support SVG directly without additional libraries, follow these steps:

### Option 1: Use react-native-svg (Recommended)

1. Install dependencies:
```bash
npm install react-native-svg react-native-svg-transformer
```

2. Update `metro.config.js`:
```javascript
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();
  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer')
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg']
    }
  };
})();
```

3. Copy logo.svg to assets:
```bash
cp /Users/ashokverma/Documents/TechRover/elora-web/public/logo.svg /Users/ashokverma/Documents/TechRover/EloraCraftingArts/assets/
```

4. Update CustomDrawer.tsx to use SVG:
```typescript
import Logo from '../../assets/logo.svg';

// In render:
<Logo width={160} height={64} />
```

### Option 2: Convert to PNG (Quick Solution)

1. Convert SVG to PNG using online tool or command:
```bash
# Using ImageMagick
convert -background none -density 300 logo.svg logo.png
convert -background none -density 600 logo.svg logo@2x.png
convert -background none -density 900 logo.svg logo@3x.png
```

2. Place files in:
```
/Users/ashokverma/Documents/TechRover/EloraCraftingArts/assets/
  - logo.png (1x)
  - logo@2x.png (2x)
  - logo@3x.png (3x)
```

### Option 3: Use react-native-fast-image

For better performance with images:
```bash
npm install react-native-fast-image
```

## Theme-Based Logo Colors

The logo uses two colors that should adapt to theme:
- `.fil0` (Primary): `#F6B21C` (Orange)
- `.fil1` (Secondary): `#FECC00` (Yellow)

For dark mode, these colors remain the same as they provide good contrast.

## Current Implementation

The CustomDrawer component expects:
```
/Users/ashokverma/Documents/TechRover/EloraCraftingArts/assets/logo.png
```

Please convert the SVG to PNG and place it in the assets folder, or use Option 1 for native SVG support.
