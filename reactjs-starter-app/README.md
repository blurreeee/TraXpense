# SpendWise — Expense Tracker Starter Kit

A React starter kit for building a full-featured expense tracker. Scaffolded with a production-ready stack so you can focus on features, not configuration.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The app redirects `/` to `/dashboard` automatically.

---

## Folder Structure

```
src/
├── components/
│   └── shared/
│       ├── Layout.jsx       # App shell: antd Sider + content area
│       └── PageWrapper.jsx  # Reusable page title + description header
├── pages/
│   ├── DashboardPage.jsx    # Summary statistics and chart placeholder
│   ├── ExpensesPage.jsx     # Sortable expenses table
│   ├── AddExpensePage.jsx   # Form to log a new expense
│   └── ChatPage.jsx         # AI assistant placeholder
├── hooks/
│   └── useApi.js            # Generic fetch wrapper with loading/error/data
├── lib/
│   ├── api.js               # Thin fetch client (GET/POST/PUT/DELETE)
│   ├── constants.js         # Shared constants (categories, currency)
│   └── utils.js             # formatCurrency, formatDate helpers
└── assets/                  # Static images and fonts
```

---

## Libraries

| Library | Version | Why |
|---|---|---|
| **React** | 18 | UI component model |
| **Vite** | 5 | Fast dev server and bundler with HMR |
| **Tailwind CSS** | v4 | Utility classes for layout and spacing only |
| **Ant Design** | 6 | Full-featured component library — handles all component styling |
| **@ant-design/icons** | latest | Icon set that pairs with antd |
| **React Router** | v7 | Client-side routing with nested layouts |

### Design decision: Tailwind + Ant Design

Tailwind handles **layout** (`flex`, `grid`, `gap`, `p-*`, `m-*`). Ant Design handles **components** (buttons, forms, tables, cards). The two don't conflict because Tailwind v4 only generates classes you use and antd manages its own component styles via CSS-in-JS.

---

## Routes

| Path | Page | Description |
|---|---|---|
| `/` | — | Redirects to `/dashboard` |
| `/dashboard` | DashboardPage | Spending summary with stat cards |
| `/expenses` | ExpensesPage | Paginated, sortable expense table |
| `/add` | AddExpensePage | Form to add a new expense |
| `/chat` | ChatPage | AI assistant (placeholder) |

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=https://your-api.example.com
```

Used by `src/lib/api.js` as the base URL for all API requests. Defaults to an empty string (same origin) if not set.
