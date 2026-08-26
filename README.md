# godaddy-site

Minimal React + Vite site with one embedded YouTube video, built to be uploaded to GoDaddy shared hosting as static files.

## Local dev

```
npm install
npm run dev
```

## Configure the video and title

Edit `src/App.jsx`:

- `YOUTUBE_VIDEO_ID` — the ID from a YouTube URL (`https://www.youtube.com/watch?v=<THIS_PART>`).
- `PAGE_TITLE` — the heading shown above the video.

## Build for GoDaddy

```
npm run build
```

This produces a `dist/` folder. Upload **the contents of `dist/`** (not the folder itself) to your GoDaddy hosting:

- **cPanel File Manager** → open `public_html/` → upload every file/folder from `dist/`.
- Or **FTP/SFTP** to the same `public_html/` directory.

`vite.config.js` sets `base: './'` so the built assets use relative paths and work whether the site is served from the domain root or a subfolder.
