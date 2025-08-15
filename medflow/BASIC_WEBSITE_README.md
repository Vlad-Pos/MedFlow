# Basic Website - Parallel Implementation

This directory contains a parallel website implementation that runs alongside your main MedFlow application without overlapping.

## Structure

### Pages
- `BasicWebsite.tsx` - Basic implementation using the original skeleton
- `EnhancedBasicWebsite.tsx` - Enhanced implementation using modular components

### Components
- `BasicLayoutSkeleton.tsx` - Original layout skeleton
- `EnhancedBasicLayout.tsx` - Enhanced layout using modular components

### Modular Components (`/modules`)
- `Header.tsx` - Customizable header with navigation
- `Hero.tsx` - Hero section with headline, description, and CTA
- `Features.tsx` - Features list section
- `Pricing.tsx` - Pricing plans section
- `Contact.tsx` - Contact form section
- `Footer.tsx` - Footer section

## Usage

### Basic Implementation
```tsx
import BasicWebsite from './pages/BasicWebsite';

// Use in your routing
<Route path="/basic" element={<BasicWebsite />} />
```

### Enhanced Implementation (Recommended)
```tsx
import EnhancedBasicWebsite from './pages/EnhancedBasicWebsite';

// Use in your routing
<Route path="/enhanced" element={<EnhancedBasicWebsite />} />
```

### Using Individual Modules
```tsx
import { Hero, Features, Pricing } from './components/modules';

// Customize and use individual components
<Hero
  headline="Your Headline"
  description="Your description"
  ctaText="Get Started"
  onCtaClick={() => console.log('CTA clicked')}
/>
```

## Customization

### Header
```tsx
const navLinks = [
  { id: "home", text: "Home", href: "#home" },
  { id: "about", text: "About", href: "#about" },
  // Add more navigation links
];

<Header navLinks={navLinks} title="Custom Title" />
```

### Features
```tsx
const features = [
  { id: "1", text: "Your custom feature" },
  { id: "2", text: "Another feature" },
  // Add more features
];

<Features title="Your Features" features={features} />
```

### Pricing
```tsx
const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "$9/month",
    features: ["Feature 1", "Feature 2"],
    ctaText: "Choose Basic",
    onSelect: () => handlePlanSelection("basic")
  }
];

<Pricing title="Choose Your Plan" description="Select the perfect plan" plans={plans} />
```

### Contact
```tsx
const handleSubmit = (data: { email: string; message: string }) => {
  // Handle form submission
  console.log('Form data:', data);
};

<Contact
  title="Get In Touch"
  description="We'd love to hear from you"
  onSubmit={handleSubmit}
/>
```

## Styling

All components use Tailwind CSS classes and maintain the dark theme (`bg-[#243153]`) with purple accents (`bg-purple-700`). You can customize colors and styling by modifying the className props or updating the component styles.

## Future Implementation

The modular structure allows for:
- Easy addition of new sections
- Component reuse across different pages
- Simple customization of content and styling
- Integration with state management systems
- Easy testing of individual components

## Integration with Main App

To integrate this with your main routing system, add routes to your main App.tsx or router configuration:

```tsx
import { Routes, Route } from 'react-router-dom';
import BasicWebsite from './pages/BasicWebsite';
import EnhancedBasicWebsite from './pages/EnhancedBasicWebsite';

<Routes>
  <Route path="/" element={<YourMainApp />} />
  <Route path="/basic" element={<BasicWebsite />} />
  <Route path="/enhanced" element={<EnhancedBasicWebsite />} />
</Routes>
```

This ensures both websites run in parallel without overlapping functionality.



