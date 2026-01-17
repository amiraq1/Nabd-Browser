# نبض (Nabdh) Browser

## Overview

نبض (Nabdh - meaning "pulse") is a privacy-conscious Arabic web browser built with React Native/Expo that integrates AI capabilities for content summarization and explanation. The app targets Arabic speakers with full RTL support, featuring a dark-mode-first design with distinctive incognito mode styling. The browser provides standard web navigation alongside AI-powered features via a bottom sheet interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54, using the new React architecture
- **Navigation**: React Navigation with native stack navigator - single stack with modal overlays pattern (no tab navigation)
- **State Management**: React Context (BrowserContext) for browser state, TanStack Query for server state
- **UI Components**: Custom themed components with Reanimated for animations, Bottom Sheet for modals
- **Styling**: StyleSheet-based with centralized theme constants supporting dark mode and incognito variants
- **RTL Support**: Forced RTL layout for Arabic language support via I18nManager
- **Typography**: Tajawal font family for Arabic text rendering

### Backend Architecture
- **Runtime**: Express.js server with TypeScript (tsx for development, esbuild for production)
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **AI Integration**: Anthropic Claude API (claude-sonnet-4-5) for content summarization and text explanation
- **CORS**: Dynamic origin handling for Replit domains and localhost development

### Data Storage
- **Client-side**: AsyncStorage for bookmarks, history, and downloads persistence
- **Server-side**: PostgreSQL with Drizzle ORM (schema defined but MemStorage currently used for users)
- **Schema**: Users table with UUID primary keys, conversations and messages tables for chat history

### Key Design Decisions
1. **Monorepo Structure**: Client code in `/client`, server in `/server`, shared types in `/shared`
2. **Path Aliases**: `@/` maps to client, `@shared/` maps to shared directory
3. **Web-first with Native Support**: Expo configured for web output with iOS/Android support
4. **AI Features**: Server-proxied AI calls to handle API keys securely

## External Dependencies

### AI Services
- **Anthropic Claude API**: Content summarization and explanation features
  - Environment variables: `AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`

### Database
- **PostgreSQL**: Required for production (Drizzle ORM configured)
  - Environment variable: `DATABASE_URL`

### Key NPM Packages
- `@gorhom/bottom-sheet`: Modal sheets for tabs and AI panel
- `react-native-webview`: Web content rendering
- `expo-haptics`: Tactile feedback
- `@react-native-async-storage/async-storage`: Local data persistence

### Replit Integration
- Batch processing utilities for rate-limited AI calls
- Chat routes for conversation persistence
- Environment variables for domain configuration (`REPLIT_DEV_DOMAIN`, `EXPO_PUBLIC_DOMAIN`)

## Recent Changes (January 2026)

### MVP Implementation Complete
1. **Browser Core Features**:
   - URL bar with search/URL detection and navigation
   - WebView container for web content rendering
   - Progress bar during page loading
   - Navigation controls (Back, Forward, Reload, Home)

2. **Tab Management**:
   - Create/close/switch tabs
   - Tab grid view in bottom sheet
   - Incognito mode with separate styling
   - FAB with tab count display

3. **Data Persistence**:
   - Bookmarks: Add/remove/view saved pages
   - History: Auto-save visited pages with timestamps
   - Downloads: Track downloaded files
   - All using AsyncStorage for local storage

4. **AI Integration**:
   - AI panel bottom sheet
   - Page summarization (تلخيص الصفحة)
   - Text explanation (شرح النص المحدد)
   - Q&A about page (سؤال عن الصفحة)
   - Powered by Claude sonnet 4.5 via Replit AI Integrations

5. **UI/UX**:
   - Arabic RTL layout support
   - Dark mode with electric cyan accent
   - Incognito mode with deep indigo theme
   - Tajawal Arabic font
   - Haptic feedback on interactions
   - Smooth animations with Reanimated

## Project Structure

```
client/
├── App.tsx                    # App entry with providers
├── context/BrowserContext.tsx # Browser state management
├── types/browser.ts           # TypeScript interfaces
├── lib/storage.ts             # AsyncStorage utilities
├── components/browser/        # Browser-specific components
│   ├── UrlBar.tsx
│   ├── NavigationBar.tsx
│   ├── WebViewContainer.tsx
│   ├── ProgressBar.tsx
│   ├── TabCard.tsx
│   ├── TabsBottomSheet.tsx
│   ├── AIPanelSheet.tsx
│   ├── DrawerMenu.tsx
│   └── FAB.tsx
├── screens/
│   ├── BrowserScreen.tsx      # Main browser screen
│   ├── BookmarksScreen.tsx
│   ├── HistoryScreen.tsx
│   ├── DownloadsScreen.tsx
│   └── SettingsScreen.tsx
└── navigation/
    └── RootStackNavigator.tsx

server/
├── index.ts                   # Express server entry
├── routes.ts                  # API routes including AI endpoints
└── replit_integrations/
    ├── batch/                 # Rate limiting utilities
    └── chat/                  # Chat storage (optional)
```

## API Endpoints

- `POST /api/ai/summarize` - Summarize page content
- `POST /api/ai/explain` - Explain selected text
- `POST /api/ai/ask` - Answer questions about page content