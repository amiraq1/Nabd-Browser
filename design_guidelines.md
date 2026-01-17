# Design Guidelines: نبض Browser

## 1. Brand Identity

**Purpose**: نبض (Nabdh - meaning "pulse" or "beat") is a powerful, privacy-conscious Arabic browser that brings AI intelligence to web browsing. It serves Arabic speakers who demand speed, privacy, and smart content interaction.

**Aesthetic Direction**: **Bold/Striking with Editorial Sophistication**
- High contrast design with deep blacks and vibrant accents
- Clean typographic hierarchy that respects Arabic calligraphic tradition
- Dramatic yet functional - every element serves a purpose
- Trust-building through visual clarity and confident design choices

**Memorable Element**: The AI panel slides up like a "pulse" - smooth, rhythmic, alive. Incognito mode transforms the entire UI to deep indigo with a subtle mask icon watermark, making privacy mode unmistakable.

## 2. Navigation Architecture

**Root Navigation**: Single-Stack with Modal Overlays (no tabs, drawer appears via hamburger menu)

**Screen Inventory**:
1. **Browser Screen** (main) - Web browsing with controls
2. **Tabs Overview** (modal bottom sheet) - Grid of open tabs
3. **AI Panel** (modal bottom sheet) - AI interactions
4. **Bookmarks** (full screen) - Saved pages list
5. **History** (full screen) - Browsing history list
6. **Downloads** (full screen) - Downloaded files list
7. **Settings** (full screen) - App preferences

## 3. Screen-by-Screen Specifications

### Browser Screen (Main)
**Purpose**: Core browsing experience

**Layout**:
- **Header**: Custom header (72dp height)
  - Left: Hamburger menu icon (opens drawer with Bookmarks/History/Downloads/Settings)
  - Center: URL/Search TextField (48dp height, rounded 24dp corners)
  - Right: Tabs counter badge (shows number, tap opens Tabs Overview)
- **Content**: WebView (full width/height below header, above nav bar)
  - Progress bar (2dp height, positioned at top of WebView)
- **Bottom Navigation Bar**: Fixed bar (56dp height)
  - Back, Forward, Reload, Home, AI Panel icons (evenly spaced)
  - Icons dim when action unavailable (e.g., back when no history)
- **Floating Action Button**: New Tab (+) button
  - Position: bottom-right, 16dp from edges and above bottom nav
  - Size: 56dp diameter
  - Long press reveals Incognito option

**Safe Areas**:
- Top: statusBarHeight + 72dp (header)
- Bottom: navigationBarHeight + 56dp (bottom nav)

### Tabs Overview (Modal Bottom Sheet)
**Purpose**: Switch between or manage open tabs

**Layout**:
- **Header**: "التبويبات" title, Close X on right
- **Content**: Grid (2 columns, 16dp spacing)
  - Each card shows: thumbnail/favicon, title, URL snippet, close X
  - New Tab card (+ icon, "تبويب جديد")
  - Incognito tabs visually distinct (indigo tint, mask icon)
- Sheet height: 70% of screen

### AI Panel (Modal Bottom Sheet)
**Purpose**: Interact with page content via AI

**Layout**:
- **Header**: "AI" with sparkle icon, Close X
- **Action Buttons** (when no conversation):
  - "تلخيص الصفحة" (Summarize)
  - "شرح النص المحدد" (Explain selection, disabled if no text selected)
  - "سؤال عن الصفحة" (Ask about page)
- **Chat Area** (after action triggered):
  - Scrollable message list
  - User messages: right-aligned, accent color background
  - AI responses: left-aligned, surface color background
  - Input field at bottom with send icon

**Safe Areas**: Bottom: navigationBarHeight + 16dp

### Bookmarks Screen
**Purpose**: Access saved pages

**Layout**:
- **Header**: Standard with "المفضلة" title, back button left
- **Content**: Scrollable list
  - Each item: favicon, title, URL, delete icon
  - Empty state: Illustration + "لا توجد مفضلات بعد"

### History Screen
**Purpose**: Browse past visits

**Layout**:
- **Header**: Standard with "السجل" title, back button left, "مسح الكل" right
- **Content**: Scrollable list grouped by date
  - Each item: favicon, title, URL, timestamp
  - Empty state: Illustration + "لا يوجد سجل"

### Downloads Screen
**Purpose**: Manage downloaded files

**Layout**:
- **Header**: Standard with "التنزيلات" title, back button left
- **Content**: Scrollable list
  - Each item: file icon, filename, size, date, open icon
  - Empty state: Illustration + "لا توجد تنزيلات"

### Settings Screen
**Purpose**: Configure app preferences

**Layout**:
- **Header**: Standard with "الإعدادات" title, back button left
- **Content**: Scrollable form (grouped sections)
  - Privacy: Clear cache, Clear cookies
  - General: Default search engine, Homepage
  - About: Version, Privacy policy

## 4. Color Palette

**Primary**: #0A0A0A (Rich Black) - dominant, used for backgrounds, headers
**Accent**: #00D9FF (Electric Cyan) - sharp contrast, used for active states, AI branding
**Surface**: #1A1A1A (Dark Gray) - cards, elevated elements
**Background**: #0A0A0A (same as primary)
**On-Surface**: #FFFFFF (White) - primary text
**On-Surface-Variant**: #A0A0A0 (Light Gray) - secondary text, disabled states
**Incognito Accent**: #3D5AFE (Deep Indigo) - used exclusively in incognito mode
**Semantic Colors**:
- Success: #00E676 (Green)
- Error: #FF3D00 (Red)
- Progress: #00D9FF (matches accent)

## 5. Typography

**Primary Font**: Tajawal (Google Font, modern Arabic sans-serif)
**Secondary Font**: Inter (Latin fallback for mixed content)

**Type Scale**:
- H1: 28sp, Bold - Screen titles
- H2: 20sp, SemiBold - Section headers
- Body: 16sp, Regular - URLs, list items
- Caption: 14sp, Regular - Timestamps, metadata
- Button: 16sp, Medium - Action text

## 6. Visual Design

- **Icons**: Material Icons, 24dp size
- **Corner Radius**: 16dp for cards, 24dp for text fields, 28dp for FAB
- **Elevation**: Minimal - use subtle borders instead of shadows
  - FAB shadow: offsetY: 4dp, blur: 8dp, opacity: 0.3
- **Ripple Effect**: All touchables use Material ripple (accent color at 12% opacity)
- **Incognito Mode**: Entire UI shifts to dark indigo background (#1A237E) with accent remaining cyan

## 7. Assets to Generate

**REQUIRED**:
1. **icon.png** - App icon: Stylized pulse wave in cyan on black circle
   - WHERE USED: Device launcher
2. **splash-icon.png** - Same pulse wave, larger
   - WHERE USED: App launch screen
3. **empty-bookmarks.png** - Open book with bookmark ribbon, minimal line art
   - WHERE USED: Bookmarks screen empty state
4. **empty-history.png** - Clock with rewinding arrow, minimal line art
   - WHERE USED: History screen empty state
5. **empty-downloads.png** - Folder with downward arrow, minimal line art
   - WHERE USED: Downloads screen empty state
6. **empty-tabs.png** - Overlapping rectangles (tab metaphor), minimal line art
   - WHERE USED: Tabs overview when all tabs closed
7. **incognito-watermark.png** - Stylized mask icon, very subtle, 20% opacity
   - WHERE USED: Background watermark in incognito mode

**Style**: All illustrations use single-color line art (cyan #00D9FF), 2px stroke weight, transparent background.