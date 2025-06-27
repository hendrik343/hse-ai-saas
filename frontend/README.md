# HSE AI SaaS - Plataforma de Segurança no Trabalho com IA

## 🚀 Fluxo de Conversão Implementado

Este projeto implementa um fluxo de conversão completo para um SaaS de análise de segurança no trabalho usando IA, seguindo as melhores práticas de UX e conversão.

### 📋 Estrutura do Fluxo

#### 1️⃣ **Landing Page Futurista** (`/`)
- Design moderno com gradientes e animações
- Hero section com call-to-action claro
- Preview das funcionalidades principais
- Indicadores de confiança (100% gratuito, 30s análise, 0 registo)
- Botão principal: "Tirar Foto Agora" → `/try`

#### 2️⃣ **Página de Teste Gratuito** (`/try`)
- Análise sem necessidade de registo
- Upload de imagem com drag & drop
- Análise AI em tempo real com progresso visual
- Resultados detalhados com:
  - Pontuação de compliance
  - Nível de risco
  - Problemas identificados
  - Recomendações
  - Violações legais
- Download de relatório PDF

#### 3️⃣ **Chamada à Ação** (Após análise)
- Apresentação das funcionalidades premium
- Grid de 6 funcionalidades principais
- Botões de conversão:
  - "Criar Conta Grátis" → `/onboarding`
  - "Ver Preços" → `/pricing`

#### 4️⃣ **Onboarding** (`/onboarding`)
- Formulário simples de registo
- Criação de organização
- Plano gratuito incluído
- Redirecionamento para dashboard

#### 5️⃣ **Dashboard** (`/dashboard`)
- Acesso completo às funcionalidades
- Histórico de análises
- Gestão por projetos
- Exportação de relatórios

### 🛠️ Tecnologias Utilizadas

- **Frontend**: Angular 20 + TypeScript
- **Styling**: SCSS com design system customizado
- **Backend**: Firebase (Firestore, Storage, Auth)
- **PDF**: jsPDF para geração de relatórios
- **UI**: Componentes standalone com design futurista

### 🎨 Design System

#### Cores Principais
- **Primary**: `#5E5CE6` (Roxo)
- **Secondary**: `#2563eb` (Azul)
- **Success**: `#10b981` (Verde)
- **Warning**: `#f59e0b` (Laranja)
- **Danger**: `#ef4444` (Vermelho)

#### Gradientes
- **Background**: `linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)`
- **Cards**: `rgba(255, 255, 255, 0.05)` com `backdrop-filter: blur(20px)`

### 📱 Responsividade

- Design mobile-first
- Breakpoints: 480px, 768px, 1024px
- Componentes adaptáveis para todos os dispositivos

### 🔧 Como Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Build para produção
npm run build
```

### 🚀 Funcionalidades Principais

#### Análise AI
- Upload de imagens com preview
- Análise automática de segurança
- Detecção de não conformidades
- Identificação de violações legais
- Geração de relatórios PDF

#### Gestão de Dados
- Armazenamento seguro no Firestore
- Organizações e utilizadores
- Histórico de análises
- Exportação de dados

#### Interface
- Design futurista e moderno
- Animações suaves
- Feedback visual em tempo real
- Navegação intuitiva

### 📊 Métricas de Conversão

O fluxo foi desenhado para maximizar a conversão:

1. **Landing Page**: Foco na demonstração de valor
2. **Teste Gratuito**: Experiência hands-on sem fricção
3. **CTA**: Apresentação clara dos benefícios premium
4. **Onboarding**: Processo simplificado de registo
5. **Dashboard**: Valor imediato após conversão

### 🔒 Segurança

- Autenticação Firebase
- Regras de segurança Firestore
- Upload seguro de imagens
- Proteção de dados sensíveis

### 📈 Próximos Passos

- [ ] Integração com APIs de IA reais
- [ ] Sistema de pagamentos
- [ ] Analytics avançados
- [ ] Notificações push
- [ ] API REST para integrações

---

**Desenvolvido com ❤️ para revolucionar a segurança no trabalho com IA**
