# TrackMan Golf Swing Analyzer

A personalized golf swing analyzer that provides focused improvement tips based on TrackMan launch monitor data.

## Features

- **Handicap-Based Personalization**: Analysis adapts to your skill level
- **TrackMan Benchmark Integration**: Compare against real tour and amateur data
- **Prioritized Recommendations**: Top 2 issues identified for focused improvement
- **Complete Club Support**: Driver, woods, irons, and all wedges (PW, GW, SW, LW)
- **Wedge Loft Customization**: Enter specific loft for gap, sand, and lob wedges
- **Session History Tracking**: Save and review past sessions for each club
- **Progress Notes**: Add notes to track what you're working on and improvements
- **Mobile-Friendly**: Responsive design works on all devices
- **Offline Capable**: No internet required after first load, all data stored locally
- **No Dependencies**: Pure HTML/CSS/JavaScript

## Live Demo

[View Demo](https://your-username.github.io/golf-analyzer) _(update after deployment)_

## Quick Start

### Option 1: Direct Use
1. Download `golf-analyzer-enhanced.html`
2. Open in any web browser
3. Enter your data and analyze!

### Option 2: Deploy to GitHub Pages (Recommended)

1. **Create GitHub Repository**
   ```bash
   # In your project folder
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/golf-analyzer.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repo Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Click Save
   - Your site will be live at: `https://YOUR-USERNAME.github.io/golf-analyzer`

3. **Update the site**
   ```bash
   # After making changes
   git add .
   git commit -m "Update description"
   git push
   # Live in 30-60 seconds!
   ```

### Option 3: Deploy to Vercel

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   # Follow prompts - it will deploy automatically
   ```

3. **Update**
   ```bash
   vercel --prod
   ```

## File Structure

```
golf-analyzer/
├── index.html              # HTML structure only (links to CSS and JS)
├── styles.css              # All styles
├── config.js               # Club targets, storage keys, constants
├── history.js              # Session history (localStorage, display, clear)
├── analysis.js             # Analysis logic (targets, issues, results display)
├── app.js                  # App entry (profile, validation, perform analysis)
├── README.md               # This file
└── .gitignore              # Git ignore file
```

Scripts must load in order: `config.js` → `history.js` → `analysis.js` → `app.js`.

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS 12+)
- ✅ Chrome Android (latest)

## What's Included

### Improvements Over Original
- ✅ Better mobile responsiveness
- ✅ Input validation with visual feedback
- ✅ Smooth scroll fallback for older browsers
- ✅ Touch-friendly inputs (no zoom on mobile)
- ✅ Loading states on button
- ✅ Enter key support for quick analysis
- ✅ Improved accessibility
- ✅ **Session history with localStorage**
- ✅ **Notes for tracking improvements**
- ✅ **All wedges with custom loft input**
- ✅ **Per-club session tracking**

## Coming Soon

- 📈 Visual progress charts and trends
- 💾 Export data to CSV/PDF
- 📱 Progressive Web App (install as app)
- 🔄 Compare sessions side-by-side

## Development

No build process required! Just edit the HTML file and refresh your browser.

### Local Testing
1. Open `index.html` in your browser
2. Or use a simple server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js
   npx serve
   ```

## Contributing

Feel free to open issues or submit pull requests!

## License

MIT License - feel free to use this however you like!

## Credits

Built with TrackMan data and golf instruction insights.
