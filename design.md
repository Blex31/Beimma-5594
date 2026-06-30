# Darco Design System

## Brand
**Name:** Darco — Instant Grocery Delivery
**Tagline:** Fresh. Fast. At your door.
**Personality:** friendly, efficient, trustworthy, modern.
**Voice:** clear, supportive, optimistic. Use short, direct microcopy that reinforces speed, freshness, and daily convenience.

## Brand Principles
- Freshness first: show produce, pantry staples, and delivery speed.
- Simple convenience: fast flows, obvious actions, minimal friction.
- Trustworthy service: clean layouts, readable text, clear progress and delivery status.
- Modern warmth: bright green energy balanced with soft neutrals and friendly illustrations.

## Color System
### Core palette
- Primary: `#16a34a` (green-600) — main buttons, selected states, active highlights.
- Primary Light: `#dcfce7` (green-100) — section backgrounds, info pill backgrounds, success surfaces.
- Primary Dark: `#14532d` (green-900) — headings, dark button text, strong emphasis.
- Accent: `#f97316` (orange-500) — promo banners, callout chips, urgency states.
- Accent Light: `#fff7ed` (orange-50) — highlight surfaces, pill backgrounds.

### Neutral palette
- Background: `#f9fafb` (gray-50) — page canvas.
- Surface: `#ffffff` — cards, modals, sheet surfaces.
- Border: `#e5e7eb` (gray-200) — dividers, card borders.
- Text Primary: `#111827` (gray-900) — main body copy.
- Text Secondary: `#6b7280` (gray-500) — secondary content, hints.
- Text Muted: `#9ca3af` (gray-400) — disabled text, metadata.

### Status colors
- Success: `#16a34a` — confirmations, success badges, delivery complete.
- Warning: `#f59e0b` — low-stock alerts, time-limited messages.
- Error: `#ef4444` — input errors, failed order state.
- Info: `#0ea5e9` — onboarding tips, progress notes.

### Usage guidance
- Use the primary color for primary CTAs and active navigation states only.
- Use accent color sparingly to preserve its impact for promos and urgent action.
- Use neutral surfaces with high contrast text for accessibility.
- Reserve error and warning colors for states, not decorative elements.

## Typography
- **Primary font:** Poppins.
- **Secondary system font stack:** Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif.

### Scales
- Display / Hero: 4rem (64px) / 3rem (48px) / 2.5rem (40px)
- Heading 1: 2rem (32px)
- Heading 2: 1.75rem (28px)
- Heading 3: 1.5rem (24px)
- Body large: 1.125rem (18px)
- Body: 1rem (16px)
- Small / caption: 0.875rem (14px)
- Note / micro: 0.75rem (12px)

### Weights & line-height
- Display: 700, 800; line-height 1.05–1.1.
- Headings: 600–700; line-height 1.2–1.35.
- Body: 400; line-height 1.6.
- Buttons / labels: 600; line-height 1.4.

### Text hierarchy
- Use bold headings for product names and section titles.
- Use medium-weight body copy for details and descriptions.
- Use smaller, muted captions for metadata like delivery times and SKU information.

## Spacing & Layout
### Grid and spacing tokens
- Base spacing unit: 4px.
- Small: 8px.
- Medium: 16px.
- Large: 24px.
- X-Large: 32px.
- Section spacing: 64px vertical on desktop.

### Layout rules
- Page width: full width edges with centered content on desktop up to 1280px.
- Content padding: 24px on mobile, 32px on tablet, 40px on desktop.
- Use consistent horizontal gutters of 16px between cards and layout zones.
- Cards and panels should have 16px–24px internal padding.
- Maintain a minimum 20px gap between major sections in mobile flows.

## Component Guidelines
### Buttons
- Primary button: filled `#16a34a` with white text, rounded-full, shadow for elevation.
- Secondary button: white background, `#16a34a` border, text in primary.
- Ghost button: transparent background, dark text, subtle hover state.
- Destructive button: `#ef4444` background or outline for delete/remove actions.
- Button states: default, hover, pressed, disabled.
- Disabled: low contrast background (`#d1d5db`) and text muted.

### Cards
- Standard card: surface `#ffffff`, subtle `shadow-sm`, border `#e5e7eb`, radius 16px.
- Product card: image top, content section, price + add-to-cart button in footer.
- Promo card: vibrant gradient background, white text, minimal secondary copy.
- Status card: left accent bar or pill for pickup/delivery status.
- Hover state: slight lift and stronger shadow.

### Inputs & forms
- Field height: 44px default, 52px large.
- Border: `1px solid #d1d5db`, radius 12px.
- Focus state: ring or border in primary green.
- Error state: border `#ef4444` + text caption.
- Helper text: small and muted below the input.

### Badges & tags
- Badge radius: 9999px (pill shape).
- Info badge: `#dcfce7` background, `#166534` text.
- Promo badge: `#f97316` background, white text.
- Status badge: `#eff6ff` background, `#0369a1` text for info; `#dcfce7`/`#065f46` for success.

### Navigation
- Top navbar for desktop web: left brand, center search field, right profile/cart icons.
- Bottom tab bar for mobile: Home, Categories, Cart, Orders, Profile.
- Sidebar nav for admin/rider dashboards: compact icons + labels, active indicator.
- Breadcrumbs: use on product pages and admin flows for navigation context.

### Imagery & illustration
- Product imagery: bright, clean photos on white or soft backgrounds.
- Category visuals: circular icon/photo with label beneath.
- Illustrative accents: simple line icons and light organic shapes.
- Use natural grocery photography and subtle gradients to reinforce freshness.

### Icons
- Use simple rounded iconography.
- Prefer filled/outline consistency in navigation and action buttons.
- Use icons to support copy, not replace text in primary actions.

## Accessibility
- Text contrast: maintain 4.5:1 ratio for body text and 3:1 for large text.
- Interactive targets: minimum 44x44px tappable areas.
- Keyboard focus: visible outline for buttons and links.
- Motion preferences: respects reduced motion settings for transitions.
- Forms: provide labels, placeholders, and helper text.

## Responsive behavior
### Breakpoints
- Mobile: 0–639px.
- Tablet: 640–1023px.
- Desktop: 1024px and above.

### Mobile
- Use full-width cards with 16px side padding.
- Sticky bottom CTAs for cart and checkout progress.
- Use bottom tab navigation for primary app areas.
- Keep headers compact and visible on scroll.

### Tablet
- Two-column sections for featured categories and promos.
- Product grids with 2–3 columns.
- Larger search input and more breathing room.

### Desktop
- 3–4 column product grids.
- Wide hero sections and dashboard panels.
- Sidebar nav for admin/rider/adaptive experiences.
- Use centered container up to 1280px.

## Motion & Interaction
- Page load: fade/slide from below, stagger product cards and sections.
- Micro-interactions: button presses, add-to-cart pop, notification snackbars.
- Progress states: smooth transitions for order status and rider tracking.
- Delivery map marker: gentle movement and pulsing ring.
- Avoid overly fast motion; keep interactions subtle and purposeful.

## Page patterns
### Home / storefront
- Top search and location summary.
- Category carousel or grid.
- Featured promos and quick reorder cards.
- Popular products section with secondary actions.
- Sticky cart summary at bottom for mobile.

### Product listing
- Clear filters, sort controls, and category chips.
- Product cards with image, name, price, rating, and add-to-cart.
- Inline labels for offers and delivery times.

### Product detail
- Large product image, price, weight, and quantity.
- Add-to-cart CTA pinned near the bottom on mobile.
- Product details, ingredients, and related items.

### Cart & checkout
- Order summary, itemized list, and edit actions.
- Promo code input and order total breakdown.
- Delivery window selection and address confirmation.
- Progress indicators and clear primary checkout CTA.

### Orders & tracking
- Order history cards with status badges.
- Active order tracking panel showing rider ETA.
- Rider profile card, estimated delivery time, and live status.

### Admin / rider dashboards
- Compact nav with quick filters.
- Metric cards showing daily orders, delivery speed, and earnings.
- Table/list views for recent orders and status updates.
- Clear action buttons for order assignment and status transitions.

## Notes
- Keep the design cohesive across mobile, web, and desktop clients.
- Favor readability and clarity over decorative complexity.
- Use brand green consistently for trust and momentum.
- Keep promo and urgency color usage intentional to avoid visual clutter.

## Design Tokens
- `color-primary`: `#16a34a`
- `color-primary-light`: `#dcfce7`
- `color-primary-dark`: `#14532d`
- `color-accent`: `#f97316`
- `color-background`: `#f9fafb`
- `color-surface`: `#ffffff`
- `color-border`: `#e5e7eb`
- `color-text-primary`: `#111827`
- `color-text-secondary`: `#6b7280`
- `font-family-base`: `Poppins, Inter, system-ui, sans-serif`
- `font-size-base`: `16px`
- `font-size-lg`: `18px`
- `font-size-xl`: `24px`
- `radius-card`: `16px`
- `radius-pill`: `9999px`
- `shadow-sm`: `0 1px 2px rgba(15, 23, 42, 0.05)`
- `spacing-xs`: `8px`
- `spacing-sm`: `16px`
- `spacing-md`: `24px`
- `spacing-lg`: `32px`
- `spacing-xl`: `64px`

## How to use this guide
- Use this document as a reference for UI styling, product design review, and implementation consistency.
- Match component states with the color, typography, and spacing rules defined here.
- Keep motion subtle and supportive; avoid distracting or overly complex animations.
- Apply responsive rules across mobile, tablet, and desktop breakpoints for a cohesive experience.
- Share this guide with designers and developers when creating new screens, flows, or components.

## Component inventory
- Hero / promo banner
- Search bar with location or quick access controls
- Category carousel/grid cards
- Product card with image, name, price, and add-to-cart
- Quantity stepper and product details panel
- Cart item list with edit/remove actions
- Order summary bar with totals and CTA
- Tab navigation for mobile
- Sidebar navigation for desktop admin/rider
- Status badges and delivery progress chips
- Profile / account card
- Promo badge and discount chip
- Notification snack bar / toast
- Filter chips and sort dropdown
- Rider tracking card with ETA and location status
- Dashboard metric cards for admin/rider
