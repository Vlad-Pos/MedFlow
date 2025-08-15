# 🚀 Framer Website Integration Guide

## Overview
This guide explains how to seamlessly integrate your Framer.com websites into the MedFlow app. The integration is designed to be **zero-code** - you just need to add your website URLs and everything works automatically.

## ✨ What's Already Set Up

✅ **Integration Components** - Ready to use  
✅ **Routing System** - Automatically configured  
✅ **Navigation** - Added to main navbar  
✅ **Error Handling** - Built-in loading and error states  
✅ **Configuration System** - Easy URL management  

## 🎯 Quick Start (2 Minutes)

### Option 1: Automated Script (Recommended)
```bash
# From your project root
node scripts/integrate-framer.js
```
Follow the prompts to add your website details.

### Option 2: Manual Configuration
1. Open `src/config/framerSites.ts`
2. Add your website details to the `framerSites` array
3. Save the file

## 📝 Configuration Format

```typescript
{
  id: 'main-website',           // Unique identifier
  name: 'Main Website',         // Display name
  url: 'https://your-site.framer.app',  // Your published Framer URL
  description: 'Company website' // Optional description
}
```

## 🌐 Adding Your First Website

1. **Publish on Framer.com**
   - Design your website in Framer
   - Click "Publish" and copy the URL

2. **Run Integration Script**
   ```bash
   node scripts/integrate-framer.js
   ```

3. **Enter Details**
   - Website name: "Main Website"
   - URL: `https://your-site.framer.app`
   - Description: "Company website"

4. **Test Integration**
   - Start dev server: `npm run dev`
   - Navigate to `/framer-websites`
   - Your website appears automatically!

## 🔧 Advanced Configuration

### Multiple Websites
Add multiple sites to the same array:

```typescript
export const framerSites: FramerSite[] = [
  {
    id: 'main-website',
    name: 'Main Website',
    url: 'https://main-site.framer.app',
    description: 'Company website'
  },
  {
    id: 'landing-page',
    name: 'Landing Page',
    url: 'https://landing.framer.app',
    description: 'Marketing campaigns'
  }
];
```

### Custom Settings
Modify `framerConfig` in the same file:

```typescript
export const framerConfig = {
  showSiteSelector: true,        // Show/hide site switcher
  defaultHeight: '600px',        // Default iframe height
  showLoadingSpinner: true,      // Loading animations
  showErrorHandling: true        // Error handling
};
```

## 📱 How It Works

### 1. **Seamless Integration**
- Your Framer websites load in iframes within the MedFlow app
- No code changes needed in your Framer projects
- Maintains all Framer functionality (animations, interactions, etc.)

### 2. **Smart Navigation**
- Added to main navbar as "Websites"
- Accessible at `/framer-websites`
- Works with existing authentication system

### 3. **Responsive Design**
- Automatically adapts to different screen sizes
- Mobile-friendly iframe handling
- Consistent with MedFlow's design system

## 🚨 Troubleshooting

### Website Not Loading
- **Check URL**: Ensure the Framer URL is correct and published
- **CORS Issues**: Framer handles this automatically
- **Network**: Check if the URL is accessible in a new tab

### Layout Issues
- **Height**: Adjust `defaultHeight` in config
- **Width**: Iframe automatically fills container
- **Mobile**: Test on different screen sizes

### Performance
- **Loading**: Built-in loading states show progress
- **Caching**: Browsers cache iframe content automatically
- **Updates**: Changes in Framer appear immediately

## 🔄 Updating Websites

### Add New Website
```bash
node scripts/integrate-framer.js
```

### Remove Website
1. Open `src/config/framerSites.ts`
2. Delete the website object from the array
3. Save the file

### Update Existing Website
1. Edit the URL in `framerSites.ts`
2. Save the file
3. Refresh the page

## 🎨 Customization Options

### Styling
- Modify `FramerWebsitePage.tsx` for page layout
- Adjust `FramerWebsite.tsx` for iframe behavior
- Update CSS classes for visual changes

### Functionality
- Add analytics tracking
- Implement custom loading states
- Add website-specific features

### Integration
- Connect with MedFlow's authentication
- Share data between app and websites
- Add custom navigation logic

## 📚 API Reference

### FramerWebsite Component
```tsx
<FramerWebsite
  url="https://your-site.framer.app"
  title="Website Title"
  className="custom-class"
  onLoad={() => console.log('Loaded!')}
  onError={(error) => console.error(error)}
/>
```

### FramerWebsiteManager Component
```tsx
<FramerWebsiteManager
  sites={framerSites}
  defaultSiteId="main-website"
  showSiteSelector={true}
  className="custom-class"
/>
```

## 🚀 Best Practices

1. **URL Management**: Keep URLs in the config file, not hardcoded
2. **Testing**: Test on multiple devices and browsers
3. **Performance**: Monitor loading times for large websites
4. **Updates**: Regularly check for Framer updates
5. **Backup**: Keep backup of your Framer projects

## 🆘 Need Help?

### Common Issues
- **Script not working**: Ensure you're in the project root directory
- **Website not showing**: Check browser console for errors
- **Layout broken**: Verify iframe dimensions and CSS

### Debug Mode
Add this to your browser console:
```javascript
// Check loaded websites
console.log(window.framerSites);

// Test iframe loading
document.querySelector('iframe').src;
```

## 🎉 Success Checklist

- [ ] Website loads in `/framer-websites`
- [ ] Navigation works correctly
- [ ] Mobile responsive
- [ ] Loading states work
- [ ] Error handling functional
- [ ] Multiple websites (if applicable) switch correctly

---

**🎯 You're all set!** Your Framer websites are now seamlessly integrated into MedFlow with zero ongoing maintenance required.
