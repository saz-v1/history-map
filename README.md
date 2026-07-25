# TimeScape

TimeScape is a web application that displays historical events on an interactive timeline.

The application gets historical event data from the Wikipedia and byabbe.se APIs. It displays the data with D3.js. You can search, filter, and explore historical events in the browser.

## Features

The application can:

* Get historical events from the Wikipedia and byabbe.se APIs.
* Display events on an interactive timeline.
* Search events by year, title, or description.
* Filter events by category.
* Cache event data for seven days.
* Open a random year.
* Open Wikipedia articles for selected events.
* Display historical eras with colour coding.
* Run on desktop, tablet, and mobile devices.

## Requirements

You must have:

* Node.js 18 or later
* npm or Yarn
* A modern web browser

Supported browsers include:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

## Installation

1. Go to the project directory.

```bash
cd history-map
```

2. Install the dependencies.

```bash
npm install
```

3. Start the development server.

```bash
npm run dev
```

4. Open the application in your browser.

```text
http://localhost:5173
```

## Usage

### Navigate the Timeline

| Action | Result                              |
| ------ | ----------------------------------- |
| Scroll | Zoom the timeline.                  |
| Drag   | Move across the timeline.           |
| Hover  | Show event information.             |
| Click  | Open the related Wikipedia article. |

### Filter Events

* Enter text in the search field.
* Select one or more categories.
* Select **Random Year** to load a random year.
* Select **Refresh** to load the latest event data.

### Performance

* The application stores event data for seven days.
* Use category filters to reduce the number of displayed events.
* Search for a specific year to display fewer events.

## Project Structure

```text
history-map/
├── src/
│   ├── components/
│   │   ├── Timeline.tsx
│   │   ├── Tooltip.tsx
│   │   ├── FilterPanel.tsx
│   │   └── Loading.tsx
│   ├── services/
│   │   ├── historyApi.ts
│   │   └── cacheService.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## Architecture

### Components

| Component         | Purpose                              |
| ----------------- | ------------------------------------ |
| `App.tsx`         | Controls application state.          |
| `Timeline.tsx`    | Displays the timeline with D3.js.    |
| `Tooltip.tsx`     | Displays event information.          |
| `FilterPanel.tsx` | Provides search and filter controls. |
| `Loading.tsx`     | Displays the loading indicator.      |
| `historyApi.ts`   | Gets and processes event data.       |
| `cacheService.ts` | Stores cached data in local storage. |

### Data Flow

```text
Wikipedia API / byabbe.se API
            │
            ▼
     historyApi.ts
            │
            ▼
    cacheService.ts
            │
            ▼
         App.tsx
            │
            ▼
     Timeline.tsx
            │
            ▼
          Browser
```

## Technologies

| Technology   | Purpose                             |
| ------------ | ----------------------------------- |
| React        | User interface                      |
| TypeScript   | Type checking                       |
| Vite         | Build system and development server |
| D3.js        | Timeline rendering                  |
| Tailwind CSS | Styling                             |
| GSAP         | Animation                           |
| Axios        | HTTP requests                       |

## API Sources

### byabbe.se

```text
https://byabbe.se/on-this-day/{month}/{day}/events.json
```

This API:

* Returns historical events.
* Includes Wikipedia links.
* Does not require authentication.

### Wikipedia REST API

```text
https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/{month}/{day}
```

This API:

* Returns historical events.
* Provides event descriptions.
* Provides links to Wikipedia articles.

## Event Model

```typescript
interface HistoricalEvent {
  year: number;
  title: string;
  description: string;
  category: string;
  url: string;
  month?: number;
  day?: number;
}
```

The application assigns categories by keyword matching.

The default categories are:

* Science
* Politics
* Culture
* Sports
* Technology
* Nature
* Society

## Build

Create a production build.

```bash
npm run build
```

The build output is stored in the `dist` directory.

## Deployment

### Vercel

Install the Vercel CLI.

```bash
npm install -g vercel
```

Deploy the application.

```bash
vercel
```

### Netlify

Build the application.

```bash
npm run build
```

Deploy the `dist` directory with Netlify.

Or use the Netlify CLI.

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### GitHub Pages

Install `gh-pages`.

```bash
npm install --save-dev gh-pages
```

Add this script to `package.json`.

```json
{
  "scripts": {
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

Set the repository base path in `vite.config.ts`.

```typescript
export default defineConfig({
  base: "/history-map/",
});
```

Deploy the application.

```bash
npm run deploy
```

## Configuration

### Change the Cache Duration

Edit:

```text
src/services/cacheService.ts
```

Example:

```typescript
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
```

### Change the API Sources

Edit:

```text
src/services/historyApi.ts
```

### Change the Categories

Update the `CATEGORY_KEYWORDS` object in `historyApi.ts`.

### Change the Timeline Range

Edit `Timeline.tsx`.

Example:

```typescript
const xScale = d3
  .scaleLinear()
  .domain([minYear - 50, maxYear + 50]);
```

## Troubleshooting

### Events Do Not Load

* Check the network connection.
* Check the browser console for errors.
* Clear local storage.
* Reload the application.

### The Timeline Does Not Display

* Make sure the event data loaded.
* Check the browser console.
* Verify the D3.js version.

### Performance Is Slow

* Reduce the number of displayed categories.
* Search for a smaller set of events.
* Clear the cache.
* Reload the application.

## Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the development server. |
| `npm run build`   | Create a production build.    |
| `npm run preview` | Preview the production build. |
| `npm run lint`    | Run ESLint.                   |

## Credits

Historical data:

* byabbe.se
* Wikipedia

Software libraries:

* React
* TypeScript
* D3.js
* GSAP
* Tailwind CSS
* Axios

## License

This project is open source.

You can use this project for education and personal use.

## Contributing

Contributions are welcome.

Possible improvements include:

* Add a date range selector.
* Add timeline comparison.
* Add event sharing.
* Add timeline bookmarks.
* Add light theme support.
* Add collaborative timelines.
* Add audio narration.
