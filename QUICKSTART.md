# 🚀 TimeScape Quick Start Guide

Get TimeScape running in 3 minutes!

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Installation & Running

### Option 1: Quick Start (Recommended)

```bash
# Navigate to project directory
cd "/Users/ahtisham/Desktop/history map"

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**That's it!** Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Option 2: Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

## First Time Using TimeScape?

### What You'll See

1. **Loading Screen** - Events are being fetched from Wikipedia
2. **Timeline View** - A horizontal timeline with colored event nodes
3. **Filter Panel** - Search bar and category filters at the top
4. **Tooltips** - Hover over any event node to see details

### Try These First

1. **Scroll** - Zoom in and out on the timeline
2. **Drag** - Pan left and right across centuries
3. **Hover** - See event details in beautiful tooltips
4. **Click "Random Year"** - Jump to a random moment in history
5. **Use Filters** - Toggle categories like Science, Politics, Culture
6. **Search** - Try searching for "Apollo", "1969", or "revolution"

## Quick Tips

- 💡 Events are cached locally for 7 days - subsequent loads are instant!
- 💡 Click any event to open its Wikipedia article
- 💡 Use category filters to focus on specific topics
- 💡 The timeline shows historical eras (Ancient, Medieval, Modern, etc.)
- 💡 Mobile friendly - works great on phones and tablets

## Troubleshooting

### Dev server won't start?
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Events not loading?
- Check your internet connection
- Open browser console (F12) to see error messages
- Try clicking the Refresh button (↻)

### Need to clear cache?
- Open browser DevTools (F12)
- Go to Application > Local Storage
- Delete `timescape_events_cache`
- Refresh the page

## What's Next?

- Read the full [README.md](./README.md) for detailed documentation
- Explore the code in `src/components/` and `src/services/`
- Deploy to Vercel, Netlify, or GitHub Pages (see README)
- Customize colors in `tailwind.config.js`
- Add new data sources in `src/services/historyApi.ts`

## Need Help?

Check the browser console for errors or review the README for detailed troubleshooting steps.

---

**Happy exploring through history! 🕰️✨**

