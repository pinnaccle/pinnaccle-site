# Pinnaccle Site

Public landing site for Pinnaccle, a Canton-native trading venue.

## Scope

This repository contains only the deployable public website used for:

- the main `pinnaccle.xyz` landing page
- waitlist capture
- direct contact intake

It intentionally excludes backend, ledger, Daml, and internal operator code.

## Environment

Create a `.env` file from `.env.example` and set:

```bash
VITE_TRADING_UI_BASE=/
VITE_PUBLIC_INBOX_EMAIL=info@pinnaccle.xyz
VITE_PUBLIC_FORM_ENDPOINT=https://formsubmit.co/ajax/info@pinnaccle.xyz
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

The site is intended for Vercel deployment with `dist` as the output directory.
