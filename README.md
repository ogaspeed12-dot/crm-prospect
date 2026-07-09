# CRM Prospect

SaaS CRM multitenant pour la gestion des prospects et du pipeline commercial.

## Stack

- **React 19** + TypeScript + Vite
- **Tailwind CSS** pour le style
- **React Router** pour le routing
- **TanStack Query** pour la gestion des données serveur
- **Zustand** pour l'état global
- **Axios** avec intercepteurs multitenant (X-Tenant-ID)

## Structure

```
src/
├── app/          — Router et providers
├── features/     — Modules métier (auth, dashboard, contacts, deals, tenants)
├── lib/          — API client, store
└── shared/       — Composants, hooks et types partagés
```

## Démarrage

```bash
npm install
npm run dev
```
