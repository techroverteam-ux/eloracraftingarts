# Mobile App Complete Setup Guide

## ✅ Implementation Complete

All web portal functionalities have been implemented in the mobile app with:
- ✅ Drawer navigation with sidebar (matching web portal)
- ✅ Permission-based menu items
- ✅ Theme support (light/dark mode)
- ✅ Logo integration
- ✅ All CRUD operations
- ✅ Bulk operations (upload, export, PPT, PDF)
- ✅ Filters and search
- ✅ Pagination
- ✅ Mobile-optimized UI/UX

## Installation Steps

### 1. Install Dependencies

```bash
cd /Users/ashokverma/Documents/TechRover/EloraCraftingArts

# Install new dependencies
npm install @react-navigation/drawer react-native-reanimated react-native-document-picker nativewind tailwindcss

# For iOS
cd ios && pod install && cd ..
```

### 2. Setup Logo

Convert the SVG logo to PNG and place in assets folder:

```bash
# Create assets folder if not exists
mkdir -p assets

# Copy and convert logo (use online tool or ImageMagick)
# Place logo.png in assets folder
```

Or use react-native-svg (already installed):
```bash
cp /Users/ashokverma/Documents/TechRover/elora-web/public/logo.svg assets/
```

### 3. Configure Babel for Reanimated

Update `babel.config.js`:
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin', 'nativewind/babel'],
};
```

### 4. Configure TailwindCSS

Create `tailwind.config.js`:
```javascript
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### 5. Run the App

```bash
# Clear cache
npm run start:reset

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Navigation Structure

```
AppNavigator (Stack)
├── Login Screen (if not authenticated)
└── Main (Drawer) (if authenticated)
    ├── Dashboard
    ├── Users (if has permission)
    ├── Roles (if has permission)
    ├── Recce (if has permission)
    ├── Installation (if has permission)
    ├── Enquiries (if has permission)
    └── Reports (always visible)
```

## Sidebar Features

### Permission-Based Menu
- Automatically shows/hides menu items based on user roles
- SUPER_ADMIN sees all menus
- Other users see only permitted modules

### Theme Support
- Light mode: Yellow accent (#eab308)
- Dark mode: Purple background with yellow accent
- Logo adapts to theme

### Menu Items
1. **Dashboard** - Always visible
2. **User Management** - Requires 'users' view permission
3. **Role Management** - Requires 'roles' view permission
4. **Recce** - Requires 'recce' view permission
5. **Installation** - Requires 'installation' view permission
6. **Enquiries** - Requires 'enquiries' view permission
7. **Reports** - Always visible

### Logout Button
- Fixed at bottom of sidebar
- Theme-aware styling
- Clears auth and redirects to login

## Screen Headers

Each screen now includes:
- Menu button (opens drawer)
- Screen title
- Theme toggle button

## Files Created/Updated

### Navigation
- `/src/navigation/AppNavigator.tsx` - Main navigation with drawer
- `/src/components/CustomDrawer.tsx` - Sidebar component
- `/src/components/Header.tsx` - Header with menu toggle

### Screens (All Complete)
- `/src/screens/users/UsersScreen.tsx`
- `/src/screens/roles/RolesScreen.tsx`
- `/src/screens/recce/RecceScreen.tsx`
- `/src/screens/installation/InstallationScreen.tsx`
- `/src/screens/enquiries/EnquiriesScreen.tsx`
- `/src/screens/reports/ReportsScreen.tsx`

### Documentation
- `/MOBILE_IMPLEMENTATION.md` - Complete feature list
- `/LOGO_SETUP.md` - Logo setup instructions
- `/SETUP_GUIDE.md` - This file

## API Integration

All screens are fully integrated with backend APIs:
- Base URL: `https://elora-api-smoky.vercel.app/api/v1`
- Authentication: Bearer token (auto-attached)
- Error handling: Toast notifications
- Loading states: ActivityIndicator

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Drawer opens/closes smoothly
- [ ] Menu items show based on permissions
- [ ] Theme toggle works
- [ ] All screens load data
- [ ] Search functionality works
- [ ] Pagination works
- [ ] CRUD operations work
- [ ] Bulk operations work
- [ ] Export functions work
- [ ] Logout works

## Troubleshooting

### Drawer not opening
```bash
# Reinstall gesture handler
npm install react-native-gesture-handler
cd ios && pod install && cd ..
```

### Logo not showing
- Ensure logo.png exists in assets folder
- Check image path in CustomDrawer.tsx
- Try using require() instead of Image source

### TailwindCSS not working
```bash
# Reinstall nativewind
npm install nativewind
# Clear cache
npm run start:reset
```

### Navigation errors
```bash
# Reinstall navigation packages
npm install @react-navigation/drawer @react-navigation/native @react-navigation/stack
cd ios && pod install && cd ..
```

## Next Steps

1. Test all functionalities
2. Add detail screens (RecceDetail, InstallationDetail)
3. Implement offline support
4. Add push notifications
5. Optimize performance
6. Add analytics
7. Submit to app stores

## Support

For issues or questions:
1. Check console logs
2. Verify API connectivity
3. Check user permissions
4. Review error messages in Toast

---

**Status**: ✅ Ready for Testing
**Last Updated**: 2024
