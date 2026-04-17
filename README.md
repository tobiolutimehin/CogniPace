# CogniPace

CogniPace is a Chrome extension for deliberate LeetCode interview practice. It combines spaced repetition with curated study paths so you can decide what to review now, what to study next, and how your practice is trending without leaving the browser.

## What It Does

- Recommends what to review now from your spaced-repetition queue
- Shows the next problem in your active course
- Adds a LeetCode page overlay for timing, notes, and review logging
- Includes a dashboard for courses, library management, analytics, settings, and backup

## Quick Start

Requirements:

- Node `24.x` LTS
- `npm`

Install and verify:

```bash
npm install
npm run check
npm run build
```

Load the extension in Chrome:

1. Open `chrome://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `dist` folder

## How It Works

- Local-first: user data stays in the extension
- No account system
- No backend service
- Chrome extension only

The main surfaces are:

- Popup for review-now and next-in-course guidance
- LeetCode overlay for in-page review logging
- Dashboard for inspection, configuration, and analytics

## Tech Stack

- React 19
- MUI + Emotion
- TypeScript
- Chrome Extension Manifest V3
- `esbuild`

## Project Docs

- [docs/product.md](docs/product.md)
- [docs/features.md](docs/features.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE)
