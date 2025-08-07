# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## MedFlow Setup

1) Install dependencies

```bash
npm install
```

2) Configure Firebase

Create a project in Firebase Console and enable:
- Authentication (Email/Password)
- Firestore (in Native mode)
- Storage

Create a `.env` file in project root with:

```
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

3) Run locally

```bash
npm run dev
```

### Sample Firestore Security Rules (MVP)

Adjust to your needs. These rules allow authenticated users to access their own data.

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth != null && request.auth.uid == uid; }

    match /users/{userId} {
      allow read: if isOwner(userId);
      allow write: if isOwner(userId);
    }

    match /appointments/{appointmentId} {
      allow read, update, delete: if isSignedIn() && resource.data.doctorId == request.auth.uid;
      allow create: if isSignedIn() && request.resource.data.doctorId == request.auth.uid;
    }

    match /documents/{docId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.resource.data.uploaderId == request.auth.uid;
      allow delete, update: if false; // tighten as needed
    }
  }
}
```

### Sample Storage Rules (MVP)

```txt
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /appointments/{appointmentId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // tighten with Firestore checks
    }
  }
}
```

### Notes
- UI text is in Romanian and prepared for multilingual support.
- Calendar color codes: Programat (albastru), Finalizat (verde), Nu s-a prezentat (roșu).
- Chatbot is a placeholder prepared for future GPT-4 integration.
- For TailwindCSS v4, styles are imported via `@import "tailwindcss";` in `src/index.css`.
