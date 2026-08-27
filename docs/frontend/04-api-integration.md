# API Integration

## Source of Truth

The backend API contract is defined in:

```text
schema.yml
```

This OpenAPI schema is the single source of truth for all frontend-backend communication.

If any information inside this document conflicts with the OpenAPI schema, the schema takes priority.

---

## API Base URL

Environment variables must be used.

Example:

```env
VITE_API_URL=https://api.suxonashop.uz
```

---

## Authentication

Authentication uses JWT tokens.

Frontend must:

* Store access token
* Store refresh token
* Automatically attach Authorization header
* Handle unauthorized responses

---

## API Client

All requests must go through:

```text
src/services/api.ts
```

using Axios.

---

## Type Generation

Frontend should generate TypeScript types from the OpenAPI schema whenever possible.

Preferred workflow:

schema.yml

↓

Generated Types

↓

Services

↓

React Query Hooks

↓

UI Components

---

## Service Structure

auth.service.ts

products.service.ts

stores.service.ts

orders.service.ts

cart.service.ts

addresses.service.ts

banners.service.ts

---

## Query Hooks

useProducts

useProduct

useStores

useStore

useOrders

useCart

useProfile

---

## Error Handling

Use backend error messages when appropriate.

Display user-friendly messages in UI.

Never expose raw server responses directly.
