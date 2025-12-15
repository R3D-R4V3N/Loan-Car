# Persoonlijke renteloze autolening

Een moderne full-stack app voor het visualiseren en beheren van een renteloze autolening van €20.000 met een looptijd van 60 maanden.

## Functionaliteit
- Dashboard met openstaand bedrag, progress bar en kernstatistieken.
- Realtime charts (Recharts) voor resterend saldo en betaald vs. openstaand.
- Tabel met alle 60 maanden, directe toggle tussen betaald/onbetaald en detailmodal met datum & notitie.
- Validatie op looptijd en automatische herberekening van stats.
- Productieklaar login tegen de API (gebruik de accounts hieronder).

## Tech stack
- Frontend: React + TypeScript, Vite, Tailwind CSS, Recharts
- State: React hooks
- Backend: Node.js + Express
- Database: MySQL met Prisma schema

## Installatie
1. Installeer dependencies:
   ```bash
   npm install
   ```

2. Zet de database connectie (MySQL) en JWT secret in `.env`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/loan"
   PORT=4000
   JWT_SECRET="vervang_dit_met_een_lang_geheim"
   ```

3. Draai migraties en genereer de Prisma client (maakt ook de basisstructuur):
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. Start de backend API:
   ```bash
   npm run server
   ```

5. Start de frontend voor lokale ontwikkeling:
   ```bash
   npm run dev
   ```

6. Productiebouw maken en serveren (Vite build + Node API):
   ```bash
   npm run build
   npm run preview # of serve de dist/ map via je voorkeursserver
   ```

De frontend verwacht standaard dat de API op `http://localhost:4000` draait (pas `VITE_API_URL` aan indien nodig).

## Seed-data (productieklaar)
Bij de eerste API-start worden automatisch de autolening (20k, 60 maanden, €330/maand) en 5 gebruikers aangemaakt. Er worden geen mockrecords in de UI gebruikt; alle data komt uit de database.

- Startdatum lening: **1 januari 2026** (alle maandlabels volgen deze datum in de UI)

Beschikbare accounts:
- Gilbert / BMW123
- Christian / BMW123
- Frank / BMW123
- Jasper / BMW123
- Guest / BMW123

Alleen **Jasper** heeft toestemming om betalingsdata te wijzigen; andere gebruikers kunnen uitsluitend het dashboard en de grafieken in read-only modus bekijken.

## REST API
- `POST /auth/login` – ontvang een JWT voor een geldige gebruiker.
- `GET /loan` – samenvatting van de lening inclusief voortgang (Bearer token vereist).
- `GET /payments` – lijst van alle 60 betalingen (Bearer token vereist).
- `POST /payments/:month` – status/datum/notitie voor de betreffende maand bijwerken (beveiliging op looptijd en token vereist, alleen Jasper toegestaan).

## Ontwikkelnotities
- Tailwind wordt geconfigureerd via `tailwind.config.js` en `postcss.config.js`.
- TypeScript types vind je in `src/types.ts`.
- Componenten zijn opgesplitst in `Dashboard`, `LoanCharts`, `PaymentTable`, `PaymentModal` en `Login`.
- De login flow gebruikt JWT en axios interceptors om de token automatisch mee te sturen.
- De betalingentabel pagineert per 12 maanden (per jaar) en toont expliciet maand + jaar op basis van de startdatum.
