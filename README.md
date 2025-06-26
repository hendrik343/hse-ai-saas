# 🛡️ HSE AI SaaS Platform

A modern Health, Safety & Environment (HSE) AI-powered SaaS platform built with Angular 18+, Firebase, and cutting-edge web technologies.

![Angular](https://img.shields.io/badge/Angular-18+-red?style=flat-square&logo=angular)
![Firebase](https://img.shields.io/badge/Firebase-Latest-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 🚀 Features

### ⚡ Modern Architecture
- **Angular 18+** with Signals for reactive state management
- **Standalone Components** - No NgModules needed
- **Modern Dependency Injection** with `inject()` function
- **TypeScript Strict Mode** for enhanced type safety

### 🎨 Professional Design
- **Linear-inspired Dark Theme** with professional aesthetics
- **Responsive Design** - Mobile-first approach
- **Inter Font** for modern typography
- **BEM Methodology** for maintainable CSS

### 🔐 Authentication & Security
- **Firebase Authentication** integration
- **Role-based Access Control**
- **Organization Management**
- **Secure API Communication**

### 🌍 Internationalization
- **Multi-language Support** (Portuguese, English, French)
- **Dynamic Language Switching**
- **Localized Content**

### 🤖 AI Integration
- **AI-Powered Report Generation**
- **Firebase Cloud Functions** for backend processing
- **Real-time Data Synchronization**
- **Smart Content Analysis**

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or later)
- **npm** (v9.0.0 or later)
- **Angular CLI** (v18.0.0 or later)
- **Firebase CLI** (v13.0.0 or later)
- **Git** (v2.30.0 or later)

```bash
# Check versions
node --version
npm --version
ng version
firebase --version
git --version
```

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/hse-ai-saas.git
cd hse-ai-saas
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Firebase Functions Dependencies

```bash
cd ../functions
npm install
```

### 4. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Cloud Functions
3. Copy your Firebase config and update `frontend/src/environments/environment.ts`

```typescript
***REMOVED***
***REMOVED***
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
  }
***REMOVED***
```

4. Initialize Firebase in your project:

```bash
firebase login
firebase init
```

## 🚀 Development

### Start Development Server

```bash
# Frontend (Angular)
cd frontend
npm start
# Server will be available at http://localhost:4200

# Firebase Emulators (in another terminal)
cd ..
firebase emulators:start
```

### Build for Production

```bash
# Frontend
cd frontend
npm run build

# Deploy to Firebase
cd ..
firebase deploy
```

## 📁 Project Structure

```
hse-ai-saas/
├── frontend/                   # Angular 18+ Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable components
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   ├── services/       # Angular services
│   │   │   └── types/          # Type definitions
│   │   ├── assets/
│   │   │   └── i18n/           # Translation files
│   │   └── environments/       # Environment configs
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
└── README.md
```

## 🔧 Key Components

### Dashboard Component
Modern dashboard with Angular Signals for reactive state management:

```typescript
export class DashboardComponent {
  // Reactive state with signals
  loading = signal<boolean>(false);
  reports = toSignal(this.getReports(), { initialValue: [] });
  
  // Computed properties
  isGenerateButtonDisabled = computed(() => 
    this.loading() || this.reportForm.invalid
  );
}
```

### Authentication Service
Firebase Auth integration with modern patterns:

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  user$ = toSignal(user(this.auth), { initialValue: null });
  isAuthenticated = computed(() => !!this.user$());
}
```

### Toast Service
Modern notification system:

```typescript
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts = signal<Toast[]>([]);
  readonly toasts$ = this.toasts.asReadonly();
}
```

## 🎨 Design System

### CSS Variables

```scss
:host {
  --bg-primary: #0A0A0A;
  --bg-secondary: #141414;
  --text-primary: #EAEAEA;
  --text-secondary: #A0A0A0;
  --accent-primary: #5E5CE6;
  --border-radius: 8px;
}
```

### BEM Methodology

```scss
.card {
  &__title { }
  &__content { }
  &--primary { }
}
```

## 🌍 Internationalization

Support for multiple languages with Angular i18n:

```json
{
  "DASHBOARD": {
    "TITLE": "Dashboard",
    "AI_ANALYSIS": "AI Analysis",
    "GENERATE_BUTTON": "Generate Report"
  }
}
```

## 🔥 Firebase Integration

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ai-reports/{reportId} {
      allow read, write: if request.auth != null 
        && resource.data.organizationId == 
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
    }
  }
}
```

### Cloud Functions

```typescript
export const generateAiReport = onCall(async (request) => {
  const { prompt, reportType } = request.data;
  // AI processing logic
  return { success: true, result: aiResponse ***REMOVED***
});
```

## 📱 Responsive Design

Mobile-first design with breakpoints:

```scss
// Mobile first
.component { }

// Tablet
@media (min-width: 768px) { }

// Desktop
@media (min-width: 1024px) { }
```

## 🧪 Testing

```bash
# Unit tests
cd frontend
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

## 🚢 Deployment

### Firebase Hosting

```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Deploy functions
firebase deploy --only functions
```

### Custom Domain

1. Add domain in Firebase Console
2. Configure DNS records
3. Enable SSL certificate

## 📊 Performance

### Build Optimization

- **Tree-shaking** for unused code elimination
- **Lazy loading** for route-based code splitting
- **Service workers** for caching strategies
- **Bundle analysis** with webpack-bundle-analyzer

### Current Build Size

```
Initial chunk files   | Names         | Raw size
main-GKZ2VDZK.js     | main          | 708.51 kB
polyfills-B6TNHZQ6.js| polyfills     | 34.58 kB
styles-CO333AMH.css  | styles        | 17.63 kB
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

- **TypeScript strict mode**
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@hse-ai-saas.com
- 📚 Documentation: [docs.hse-ai-saas.com](https://docs.hse-ai-saas.com)
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/hse-ai-saas/issues)

## 🚀 Roadmap

- [ ] **Mobile App** with Ionic/Capacitor
- [ ] **Advanced Analytics** dashboard
- [ ] **Machine Learning** models for prediction
- [ ] **API Rate Limiting** and optimization
- [ ] **Multi-tenancy** improvements
- [ ] **Offline Support** with PWA features

## ⭐ Acknowledgments

- [Angular Team](https://angular.io) for the amazing framework
- [Firebase Team](https://firebase.google.com) for backend services
- [Linear](https://linear.app) for design inspiration
- [Inter Font](https://rsms.me/inter/) for typography

---

**Built with ❤️ by the HSE AI Team**
