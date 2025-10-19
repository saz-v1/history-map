# 🕰️ TimeScape - The Dynamic Interactive History Timeline

<div align="center">

![TimeScape](https://img.shields.io/badge/TimeScape-History_Visualizer-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript)
![D3.js](https://img.shields.io/badge/D3.js-7.9-F9A03C?style=for-the-badge&logo=d3.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**A visually stunning, browser-based timeline that fetches and visualizes real-world historical events dynamically from Wikipedia and byabbe.se APIs.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### Core Functionality
- **🌐 Dynamic Data Fetching** - Real historical events pulled from Wikipedia and byabbe.se APIs
- **📊 D3.js Visualization** - Smooth, scalable timeline rendering with thousands of events
- **🎨 Beautiful UI** - Dark theme with glowing event nodes and glass morphism effects
- **🔍 Smart Search** - Search by year, title, or event description
- **🏷️ Category Filtering** - Filter events by Science, Politics, Culture, Sports, Technology, Nature, Society
- **💾 Local Caching** - Events cached for 7 days to reduce API calls and improve performance
- **🎲 Random Year Explorer** - Jump to random historical moments with one click
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices

### Interactive Features
- **🔎 Zoom & Pan** - Smooth zoom controls powered by D3.js
- **✨ Hover Tooltips** - Rich tooltips with event details on hover
- **🎭 GSAP Animations** - Smooth entrance and interaction animations
- **🔗 Direct Links** - Click events to read full articles on Wikipedia
- **🎯 Era Visualization** - Color-coded historical eras (Ancient, Medieval, Modern, etc.)

### Technical Features
- **⚡ Fast Performance** - Optimized rendering for 60+ FPS
- **🛡️ Error Handling** - Graceful fallbacks for API failures
- **🎯 Type Safety** - Full TypeScript implementation
- **♻️ Modular Architecture** - Clean separation of concerns

---

## 🚀 Demo

### Screenshots

**Main Timeline View:**
- Horizontal timeline spanning centuries
- Color-coded event nodes by category
- Era bands showing historical periods

**Interactive Tooltip:**
- Event title, year, and description
- Category badge
- Direct link to Wikipedia article

**Filter Panel:**
- Search bar for filtering events
- Category toggles
- Random Year and Refresh buttons

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Setup

1. **Clone or download the project**
   ```bash
   cd "/Users/ahtisham/Desktop/history map"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🎮 Usage

### Navigation
- **Scroll**: Zoom in/out on the timeline
- **Drag**: Pan left/right across centuries
- **Hover**: View event details in tooltip
- **Click**: Open Wikipedia article in new tab

### Filtering
- **Search Bar**: Type keywords, years, or descriptions
- **Category Filters**: Click category badges to toggle visibility
- **Random Year**: Load events from a random year in history
- **Refresh**: Reload all events from APIs

### Performance Tips
- Events are cached locally for 7 days
- Use category filters to reduce visible nodes
- Search for specific years for focused exploration

---

## 🏗️ Architecture

### Project Structure
```
history map/
├── src/
│   ├── components/
│   │   ├── Timeline.tsx          # Main D3.js timeline visualization
│   │   ├── Tooltip.tsx           # Event tooltip component
│   │   ├── FilterPanel.tsx       # Search and filter controls
│   │   └── Loading.tsx           # Loading spinner
│   ├── services/
│   │   ├── historyApi.ts         # API integration layer
│   │   └── cacheService.ts       # Local storage caching
│   ├── App.tsx                   # Main app component
│   ├── index.css                 # Tailwind styles
│   └── main.tsx                  # Entry point
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

### Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework with hooks |
| **TypeScript** | Type safety and IDE support |
| **Vite** | Fast build tool and dev server |
| **D3.js** | Timeline visualization and scaling |
| **GSAP** | Smooth animations |
| **Tailwind CSS** | Utility-first styling |
| **Axios** | HTTP requests to APIs |

### Data Flow

```
API Sources (Wikipedia/byabbe.se)
        ↓
  historyApi.ts (fetch & normalize)
        ↓
  cacheService.ts (local storage)
        ↓
   App.tsx (state management)
        ↓
  Timeline.tsx (D3.js rendering)
        ↓
   User Browser (interactive visualization)
```

### API Integration

**Primary Source: byabbe.se**
```typescript
https://byabbe.se/on-this-day/{month}/{day}/events.json
```
- Returns historical events for any date
- Includes Wikipedia links
- Free, no authentication required

**Fallback: Wikipedia REST API**
```typescript
https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}
```
- Official Wikipedia API
- Rich event descriptions
- Full article access

### Event Data Model

```typescript
interface HistoricalEvent {
  year: number;           // Year of event
  title: string;          // Event title
  description: string;    // Full description
  category: string;       // Auto-categorized
  url: string;           // Wikipedia link
  month?: number;        // Optional month
  day?: number;          // Optional day
}
```

Events are automatically categorized using keyword matching:
- **Science**: space, discovery, Nobel, physics, etc.
- **Politics**: war, election, treaty, revolution, etc.
- **Culture**: art, music, literature, film, etc.
- **Sports**: Olympic, championship, record, etc.
- **Technology**: computer, internet, innovation, etc.
- **Nature**: earthquake, volcano, climate, etc.
- **Society**: civil rights, law, education, etc.

---

## 🎨 Design System

### Colors
- **Background**: `#0a0e27` (deep navy)
- **Accent**: `#3b82f6` (blue-500)
- **Text**: White/Gray gradient
- **Categories**: Color-coded by type

### Typography
- **Sans-serif**: Inter (400-800 weights)
- **Monospace**: IBM Plex Mono (for years)

### Animations
- **Entrance**: Staggered fade-in for events
- **Hover**: Scale and glow on event nodes
- **Tooltip**: Smooth fade with backdrop blur
- **Zoom**: Smooth D3.js transitions

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Follow prompts to connect your project

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Drag and drop the `dist/` folder to [Netlify Drop](https://app.netlify.com/drop)

Or use Netlify CLI:
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Deploy to GitHub Pages

1. Install gh-pages:
   ```bash
   npm i -D gh-pages
   ```

2. Add to `package.json`:
   ```json
   "scripts": {
     "deploy": "vite build && gh-pages -d dist"
   }
   ```

3. Update `vite.config.ts`:
   ```typescript
   export default defineConfig({
     base: '/history-map/',  // Your repo name
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

---

## 🔧 Configuration

### Adjust Cache Duration

Edit `src/services/cacheService.ts`:
```typescript
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
```

### Change API Sources

Edit `src/services/historyApi.ts` to modify or add new APIs.

### Customize Categories

Add new categories in `CATEGORY_KEYWORDS` object in `historyApi.ts`.

### Modify Timeline Range

In `Timeline.tsx`, adjust the year range:
```typescript
const xScale = d3.scaleLinear()
  .domain([minYear - 50, maxYear + 50])  // Adjust padding
```

---

## 🐛 Troubleshooting

### Events not loading
- Check browser console for API errors
- Verify internet connection
- Clear local storage and refresh

### Timeline not rendering
- Ensure events are loaded (check React DevTools)
- Verify D3.js version compatibility
- Check for JavaScript errors in console

### Performance issues
- Reduce number of visible categories
- Use search to filter events
- Clear cache and reload

---

## 📚 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🙏 Credits

- **Historical Data**: [byabbe.se](https://byabbe.se/on-this-day/) and [Wikipedia](https://www.wikipedia.org/)
- **Visualization**: [D3.js](https://d3js.org/)
- **Animation**: [GSAP](https://greensock.com/gsap/)
- **UI Framework**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License

This project is open source and available for educational and personal use.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

### Ideas for Enhancement
- [ ] Add date range selector
- [ ] Implement timeline comparison mode
- [ ] Add event sharing functionality
- [ ] Create timeline bookmarks
- [ ] Add dark/light theme toggle
- [ ] Implement collaborative timeline creation
- [ ] Add audio narration for events

---

<div align="center">

**Built with ❤️ using React, TypeScript, and D3.js**

⭐ Star this project if you find it interesting!

</div>
