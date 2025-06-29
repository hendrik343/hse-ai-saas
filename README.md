# 🏭 HSE AI SaaS Platform

**The First AI-Powered Workplace Safety Analysis Platform**

[![CI/CD Pipeline](https://github.com/hendrik343/hse-ai-saas/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/hendrik343/hse-ai-saas/actions)
[![Security Scan](https://github.com/hendrik343/hse-ai-saas/workflows/Security%20Scan/badge.svg)](https://github.com/hendrik343/hse-ai-saas/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **🤖 AI-Powered Analysis**: Instant safety incident analysis using Google's Gemini AI
- **🌍 Multi-Language Support**: English, Portuguese, and French
- **📊 Real-time Analytics**: Performance monitoring and Core Web Vitals tracking
- **🛡️ Enterprise Security**: Comprehensive error handling and monitoring
- **⚡ High Performance**: Intelligent caching and bundle optimization
- **📱 Progressive Web App**: Works offline with service workers
- **🔒 Role-Based Access**: Organization-based user management

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular 17    │    │   Firebase      │    │   Google AI     │
│   Frontend      │◄──►│   Backend       │◄──►│   Gemini        │
│                 │    │                 │    │                 │
│ • PWA Support   │    │ • Firestore     │    │ • Safety        │
│ • i18n          │    │ • Functions     │    │   Analysis      │
│ • Performance   │    │ • Auth          │    │ • Compliance    │
│   Monitoring    │    │ • Storage       │    │   Checking      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Angular 17** - Latest Angular with standalone components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **RxJS** - Reactive programming
- **NgRx** - State management (planned)

### Backend
- **Firebase Functions** - Serverless backend
- **Firestore** - NoSQL database
- **Firebase Auth** - Authentication
- **Firebase Storage** - File storage

### AI & Analytics
- **Google Gemini AI** - Safety analysis
- **Performance API** - Core Web Vitals
- **Error Monitoring** - Global error handling

## 📦 Installation

### Prerequisites
- Node.js 20+
- npm or yarn
- Firebase CLI
- Git

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/hendrik343/hse-ai-saas.git
   cd hse-ai-saas
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install --legacy-peer-deps
   
   # Functions
   cd ../functions
   npm install
   
   cd ../functions-hse-ai
   npm install
   
   cd ../hendrik
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp frontend/src/environments/environment.example.ts frontend/src/environments/environment.ts
   ```

4. **Firebase Configuration**
   ```bash
   firebase login
   firebase use hse-ai-saas
   ```

5. **Build and Deploy**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Deploy to Firebase
   firebase deploy
   ```

## 🔧 Development

### Available Scripts

```bash
# Frontend
npm run start          # Start development server
npm run build          # Build for production
npm run test           # Run unit tests
npm run lint           # Run linting
npm run e2e            # Run end-to-end tests

# Functions
npm run serve          # Start Firebase emulator
npm run deploy         # Deploy functions
```

### Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   npm run test
   npm run lint
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

2. **Pull Request Process**
   - Create PR from feature branch to main
   - CI/CD pipeline runs automatically
   - Code review required
   - Merge triggers deployment

## 🚀 Deployment

### Automated Deployment (Recommended)

The project uses GitHub Actions for automated CI/CD:

1. **Push to main branch**
2. **Automated pipeline runs:**
   - Install dependencies
   - Run tests and linting
   - Build application
   - Deploy to Firebase
   - Security scanning

### Manual Deployment

```bash
# Build frontend
cd frontend
npm run build

# Deploy to Firebase
firebase deploy
```

## 📊 Performance Monitoring

### Core Web Vitals
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

### Bundle Optimization
- **Initial Bundle**: < 1MB
- **Lazy Loading**: Route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Caching**: Intelligent API response caching

## 🛡️ Security

### Security Features
- **Input Validation**: All user inputs validated
- **Authentication**: Firebase Auth with role-based access
- **Error Handling**: No sensitive data exposed in errors
- **Dependency Scanning**: Automated vulnerability checks
- **HTTPS Only**: All communications encrypted

### Security Best Practices
- Environment variables for sensitive data
- Regular dependency updates
- Security scanning in CI/CD
- Input sanitization
- Rate limiting on API calls

## 🌍 Internationalization

### Supported Languages
- **English** (en) - Default
- **Portuguese** (pt) - Primary market
- **French** (fr) - Secondary market

### Adding New Languages
1. Create translation file: `src/assets/i18n/[lang].json`
2. Add language to language switcher
3. Update translation keys

## 📈 Analytics & Monitoring

### Error Monitoring
- Global error handler
- User-friendly error messages
- Error tracking with context
- Performance impact monitoring

### Performance Analytics
- Page load times
- API response times
- User interaction metrics
- Memory usage tracking

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow Angular style guide
2. **Testing**: Write unit tests for new features
3. **Documentation**: Update docs for API changes
4. **Performance**: Monitor bundle size impact

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Ensure CI/CD passes
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README first
- **Issues**: Create GitHub issue for bugs
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact support team

### Common Issues
- **Build Errors**: Check Node.js version (20+)
- **Dependency Issues**: Use `--legacy-peer-deps`
- **Firebase Errors**: Verify project configuration
- **Performance Issues**: Check bundle size limits

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Multi-language support
- ✅ Performance optimization
- ✅ Error monitoring
- ✅ CI/CD pipeline

### Phase 2 (Next)
- 🔄 Advanced analytics dashboard
- 🔄 Real-time collaboration
- 🔄 Mobile app
- 🔄 API rate limiting

### Phase 3 (Future)
- 📋 Machine learning improvements
- 📋 Advanced reporting
- 📋 Integration APIs
- 📋 Enterprise features

---

**Built with ❤️ for workplace safety**
