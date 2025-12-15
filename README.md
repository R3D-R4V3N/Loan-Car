# Persoonlijke renteloze lening

Een moderne full-stack app voor het visualiseren en beheren van een persoonlijke, renteloze lening van €20.000 met een looptijd van 60 maanden.

## Functionaliteit
- Dashboard met openstaand bedrag, progress bar en kernstatistieken.
- Realtime charts (Recharts) voor resterend saldo en betaald vs. openstaand.
- Tabel met alle 60 maanden, directe toggle tussen betaald/onbetaald en detailmodal met datum & notitie.
- Validatie op looptijd en automatische herberekening van stats.
- Eenvoudige login (gebruik `admin` / `password`).

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

2. Zet de database connectie (MySQL) in `.env`:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/loan"
   PORT=4000
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

5. Start de frontend:
   ```bash
   npm run dev
   ```

De frontend verwacht standaard dat de API op `http://localhost:4000` draait (pas `VITE_API_URL` aan indien nodig).

## Voorbeelddata
Bij de eerste API-call wordt automatisch één lening (20k, 60 maanden, €330/maand) met 60 maandrecords aangemaakt. Betalingen kunnen daarna via de UI of de REST endpoints worden aangepast.

## REST API
- `GET /loan` – samenvatting van de lening inclusief voortgang.
- `GET /payments` – lijst van alle 60 betalingen.
- `POST /payments/:month` – status/datum/notitie voor de betreffende maand bijwerken (beveiliging op looptijd).

## Ontwikkelnotities
- Tailwind wordt geconfigureerd via `tailwind.config.js` en `postcss.config.js`.
- TypeScript types vind je in `src/types.ts`.
- Componenten zijn opgesplitst in `Dashboard`, `LoanCharts`, `PaymentTable`, `PaymentModal` en `Login`.
