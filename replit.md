# Dream Babe

## Run

- Development server: `npm run dev`
- Preview port: `5000`
- Production build: `npm run build`
- Production server: `npm start`
- Type check: `npm run lint`

## Runtime notes

- Persona data is stored in the Replit-managed PostgreSQL database through Prisma.
- The app includes a local response fallback when no AI provider key is configured.
- Firebase authentication and Firestore settings use `firebase-applet-config.json`; the imported Firebase project currently reports that its default Firestore database is unavailable.
- Admin API routes require the `ADMIN_SECRET` secret.