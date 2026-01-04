# Vanduo Framework - Development Server

Development server for testing and viewing the Vanduo Framework examples in your browser.

## Setup

1. Install dependencies:
```bash
npm install
```

## Usage

Start the development server:

```bash
npm start
```

Or:

```bash
node server.js
```

The server will start on `http://localhost:3000` by default.

## Configuration

You can change the port by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Routes

- `http://localhost:3001/` - Main example page with auto-refresh (use this URL!)
- `http://localhost:3000/` - Express server directly (no auto-refresh)
- `http://localhost:3001/examples/` - Examples directory
- `http://localhost:3001/css/` - CSS files
- `http://localhost:3001/js/` - JavaScript files

**Note:** Use port 3001 (Browser-Sync) for auto-refresh functionality. Port 3000 is the underlying Express server.

## Features

- Serves static files from the framework root
- Automatically serves CSS and JS assets
- **Auto-refresh enabled** - Browser automatically reloads when you save HTML, CSS, or JS files
- File watching for HTML, CSS, and JavaScript files

