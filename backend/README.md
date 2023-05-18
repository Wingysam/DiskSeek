# DiskSeek-Backend
This is the backend for a system that would aggregate new/refurbished/used disk prices from various sites, using a collection of "Agents" to scrape the data from the sites. In its current form it doesn't really do anything.

## Developing
First, start the TypeScript compiler and have it recompile when you make changes:
```bash
npx tsc --watch
```

Then you can start the backend.
```bash
node dist/index.js
```