# AGRI-SEM Design Guidelines

## Design Approach
**Utility-Focused Agricultural Marketplace** - Prioritizing efficiency, clarity, and trust for farmers and suppliers. Clean, professional interface with agricultural identity through strategic use of green brand colors and clear information hierarchy.

## Visual Identity

### Color System
**Brand Colors** (Agricultural Green Theme):
- Primary Green: `#1b8f3a` - Main CTAs, active states, trust indicators
- Dark Green: `#0f5c24` - Headers, emphasis, navigation
- Light Green: `#e6f5eb` - Backgrounds, subtle highlights, success states
- Accent Yellow: `#f7b500` - Alerts, special offers, attention elements

**Usage**:
- Backgrounds: White base with `bg-brand-light` for sections needing subtle distinction
- Primary actions: `bg-brand` with `text-white`
- Text hierarchy: Dark green for headers, neutral grays for body
- Status indicators: Green for success/available, yellow for warnings, red for errors/low stock

### Typography
**Hierarchy**:
- H1 (Page Headers): 2.5rem (mobile) / 3rem (desktop), font-semibold, text-brand-dark
- H2 (Section Headers): 2rem / 2.25rem, font-semibold, text-gray-900
- H3 (Subsections): 1.5rem / 1.75rem, font-medium, text-gray-800
- Body: 1rem, font-normal, text-gray-700, leading-relaxed
- Small/Meta: 0.875rem, text-gray-600

**Font Stack**: System fonts for performance (ui-sans-serif, system-ui)

## Layout System

### Spacing Primitives
**Tailwind Units**: Consistent use of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (elements): `p-2`, `gap-2`, `space-x-2`
- Component spacing: `p-4`, `p-6`, `gap-4`
- Section spacing: `py-12`, `py-16`, `py-20` (desktop), `py-8` (mobile)
- Container padding: `px-4` (mobile), `px-6` (tablet), `px-8` (desktop)

### Grid Systems
- **Product Catalogs**: `grid-cols-1` (mobile) → `md:grid-cols-2` → `lg:grid-cols-3` → `xl:grid-cols-4`
- **Dashboards**: `grid-cols-1` (mobile) → `md:grid-cols-2` → `lg:grid-cols-4` for KPI tiles
- **Forms**: Single column with `max-w-2xl` for optimal readability
- **Content**: `max-w-4xl` for articles, `max-w-7xl` for main containers

## Page-Specific Designs

### Home Page
**Hero Section** (60vh minimum):
- Full-width background: Agricultural field image (vibrant green crops, warm sunlight)
- Centered overlay content with blurred background for text/CTAs
- H1: "Semences Certifiées pour l'Agriculture Moderne"
- Subtitle: Clear value proposition about quality seeds
- Primary CTA: "Parcourir le Catalogue" (bg-brand, large, prominent)
- Secondary action: "Comment ça marche" (outline button)

**Stats Bar** (below hero):
- 3-column grid on desktop, stacked on mobile
- White cards with subtle shadow: "6 Cultures Disponibles", "40+ Variétés", "Livraison Garantie"
- Icons (Lucide) + large numbers + labels

**Weather Widget** (prominent section):
- 7-day forecast cards with icons, temperatures, rainfall
- Cumulative rainfall chart (simple bar/line)
- Alert configuration CTA

**Conseil du Jour** (featured card):
- Large card with agricultural imagery
- Title, excerpt, "Lire la suite" link

### Catalog Page
**Filter Sidebar** (desktop) / Drawer (mobile):
- Culture filter (chips/checkboxes)
- Price range slider (two handles)
- Stock availability toggle
- Sort dropdown (price, name, newest)

**Product Grid**:
- Cards with 4:3 aspect ratio product images
- Product name (font-medium, truncated)
- Price (large, brand-accent color for emphasis)
- Stock badge (green/yellow/red with labels "En stock", "Stock limité", "Rupture")
- Climate suitability icons (sun, water, temperature)
- Maturity days badge
- Hover: subtle lift shadow effect

**Pagination**: Bottom-aligned, page numbers + prev/next arrows

### Product Detail Page
**Two-Column Layout** (desktop):

Left Column (60%):
- Main image (large, 3:2 ratio)
- Thumbnail gallery (4-5 images, horizontal scroll)
- Specifications table (germination rate, origin, certification)

Right Column (40%):
- Product title (H1)
- Supplier info (name, verified badge)
- Price (prominent, large)
- Stock indicator (badge + quantity)
- Quantity selector (+ / - buttons, number input)
- "Ajouter au Panier" button (full-width, bg-brand)
- "Contacter le Fournisseur" button (outline)
- Delivery estimate card
- Climate suitability indicators

**Mobile**: Stacked vertically, sticky "Ajouter au Panier" bar at bottom

### Checkout Flow
**Multi-Step Process** (Stepper at top):
1. Panier → 2. Adresse → 3. Paiement → 4. Confirmation

**Cart Review**:
- List of items with thumbnails, quantities, subtotals
- Edit/remove actions
- Total calculation section (sticky on scroll)

**Address Form**:
- Form fields with labels above inputs
- Country/Region/City dropdowns
- "Sauvegarder comme adresse par défaut" checkbox

**Payment Selection**:
- Radio cards for: Cash on Delivery, Mobile Money, Bank Transfer
- Payment proof upload zone (dashed border, upload icon, drag-drop message)
- Simulated upload progress

### Dashboard (Producer/Supplier)
**KPI Tiles** (4-column grid):
- Large number, label, trend indicator (up/down arrow, percentage)
- Icons: Orders, Revenue, Products, Customers

**Sales Chart**:
- 10-month line/area chart (Recharts)
- X-axis: months, Y-axis: revenue
- Tooltip on hover

**Activity Feed**:
- Timeline list: order updates, messages, stock alerts
- Icons + timestamps + action descriptions

### Messaging Interface
**Two-Panel Layout**:

Left Panel (30%):
- Thread list
- Unread count badges
- Last message preview
- Timestamps

Right Panel (70%):
- Chat header (participant info, product/order context)
- Message bubbles (buyer: right/brand, supplier: left/gray)
- Attachment previews (image thumbnails, file icons)
- Input field with send button and attachment option

## Component Library

### Navigation
**Header**: White background, shadow, contains:
- Logo (left)
- Search bar (center, expandable on mobile)
- Cart icon with badge, User menu (right)
- Role-based navigation links

**Footer**: Dark green background, white text:
- 3-column grid: À propos, Liens utiles, Contact
- Social media icons
- Copyright

### Buttons
- **Primary**: `bg-brand`, `text-white`, `px-6 py-3`, rounded-lg, font-medium
- **Secondary**: `border-2 border-brand`, `text-brand`, same padding/radius
- **Text**: `text-brand`, underline on hover

### Form Elements
- **Inputs**: `border border-gray-300`, `rounded-lg`, `px-4 py-2.5`, focus:ring-brand
- **Labels**: Above inputs, `text-sm font-medium text-gray-700`, `mb-1`
- **Error messages**: `text-red-600 text-sm mt-1`
- **Validation**: Red border for errors, green for success

### Cards
- White background, `rounded-xl`, `shadow-sm`, `border border-gray-100`
- `p-6` internal padding
- Hover state: `shadow-md` transition

### Badges
- **Stock**: Rounded full, px-3 py-1, text-xs, font-semibold
  - Available: bg-green-100, text-green-800
  - Limited: bg-yellow-100, text-yellow-800
  - Out: bg-red-100, text-red-800
- **Status**: Similar styling for order statuses

### Empty States
- Centered icon (large, gray-400)
- H3 message, gray-600
- Descriptive text
- Optional CTA

## Images

**Hero Image**: Full-width agricultural field with green crops in foreground, warm sunlight, blue sky. Farmer working in distance (optional). Resolution: 1920x1080 minimum.

**Product Images**: High-quality seed package photos, 800x600px, white or neutral backgrounds. Show product packaging clearly with brand/variety labels visible.

**Article Headers**: Relevant agricultural scenes (planting, harvest, fields). 1200x600px.

**Weather Widget**: Icon set for weather conditions (sun, clouds, rain). Use Lucide weather icons.

**Dashboard**: Charts rendered via Recharts library (no static images needed).

## Responsive Behavior

**Breakpoints**:
- Mobile: 320px - 767px (single column, stacked layouts)
- Tablet: 768px - 1023px (2-column grids, condensed spacing)
- Desktop: 1024px+ (full layouts, multi-column)

**Mobile Optimizations**:
- Hamburger menu for navigation
- Filter drawer instead of sidebar
- Sticky cart/CTA buttons
- Simplified charts (fewer data points)
- Collapsible sections on product details

## Accessibility
- All form inputs have visible labels
- Focus states with 2px brand-colored outline
- Minimum contrast ratio 4.5:1 for text
- ARIA labels for icon-only buttons
- Keyboard navigation support for all interactive elements
- Screen reader announcements for cart updates, form validation

## Animation (Minimal)
- Smooth transitions: 150-200ms for hover states
- Page transitions: 300ms fade
- Cart drawer: 250ms slide-in from right
- NO loading spinners for MSW (instant mock responses)
- Skeleton screens only for initial page load