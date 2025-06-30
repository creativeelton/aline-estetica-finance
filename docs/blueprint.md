# **App Name**: Alines Finances

## Core Features:

- Dashboard Overview: Dashboard overview displaying current balance, total income, and total expenses.
- Manual Entry Form: Form for users to manually record expenses with fields for date, type, category, value, payment method, and description.
- Filterable Summary Table: Summary page with a filterable table of entries by month, including the total income, expenses, and final balance.
- Data Persistence: Data storage in Firebase, within a 'lancamentos' collection. Access data by fetch upon loading the pages.
- AI Insights: AI tool that provides spending insights by analyzing expense descriptions and categorizing spending patterns.

## Style Guidelines:

- Primary color: Deep purple (#6A0DAD) to represent elegance and sophistication.
- Background color: Very light purple (#F2F0F7), a desaturated tone from the primary, for a soft and unobtrusive background.
- Accent color: Light blue (#91B5F2), an analogous color to the primary, to highlight key elements.
- Body and headline font: 'Poppins', a geometric sans-serif, for a contemporary, precise feel. Note: currently only Google Fonts are supported.
- Mobile-first, fully responsive layout using Tailwind CSS grid system for fluid breakpoints (`sm`, `md`, `lg`).
- Use rounded borders and soft shadows (`shadow-lg`, `rounded-2xl`) for a modern aesthetic.
- Employ smooth transitions and animations using Framer Motion or Tailwind Transition for a polished user experience.