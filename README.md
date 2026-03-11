This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
nvm use 20
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

restart ts server is prisma isnt updating:
cmd shift P > TypeScript: Restart Typescript Server

to migrate db to neon:
```
npx prisma migrate dev
```
if already migrated but updating, run 
```
npx prisma migrate deploy
```

Next.js App Router

Prisma 7

Node 20+

NextAuth V4

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database in Dev and Prod
Dev → file:./dev.db → SQLite file stored locally in your project.

Prod → Switch your .env DATABASE_URL to something like PostgreSQL or MySQL (e.g. on Supabase, PlanetScale, Neon, or RDS).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## STRIPE
. Set Up the Webhook

Go to Developers → Webhooks → Add endpoint
Endpoint URL:

Local dev: use Stripe CLI (see below)
Production: https://yourdomain.com/api/billing/webhook


Select these events to listen to:

customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.payment_failed


Click Add endpoint
Click Reveal signing secret → copy it → paste as STRIPE_WEBHOOK_SECRET


Must-Fix Before Launch
<!-- 1. Hardcoded personal info — This is the most urgent. There are hardcoded values that need to come out:
coachmerel.training@gmail.com referenced on the signup page
BCC on emails goes to your personal Gmail (email config) -->

<!-- 4. Remove 100+ console.log statements — These could leak session data, user info, etc. in production browser consoles. Not a great look and potentially a privacy issue. -->

High Priority (Before First Paying Clients)
5. No pricing page — You have Stripe set up but nowhere on the app does it explain what things cost. Clients/trainers will hit a billing wall with no context.

Nice to Have (Can Ship Without, But Improves Experience)
Progress/analytics charts for clients (big differentiator for a PT app)
Search/filter on exercise lists
Mobile navigation (sidebar only right now)
Loading skeleton states in more places
