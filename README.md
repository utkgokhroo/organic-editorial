# 🌿 The Organic Editorial

A production-grade, multi-page organic grocery e-commerce frontend built with React — tailored for Indian users with ₹ pricing, Indian brands, GST calculation, and UPI payment support.

---

## 📸 Overview

The Organic Editorial is a fully functional supermarket website frontend that lets users browse 55 organic products across 8 categories, manage a persistent cart, save wishlists, and complete a full checkout flow — all without a backend. State persists in `localStorage` across sessions.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| UI Library | React 18 (JavaScript, no TypeScript) |
| Routing | React Router DOM v6 |
| State Management | React Context API + useReducer |
| Styling | Pure CSS3 — no Tailwind, no Bootstrap |
| Fonts | Cormorant Garamond + Satoshi (Google Fonts) |
| Data Persistence | localStorage |
| Build Tool | Create React App (react-scripts) |

---

## ✨ Features

### 🛍️ Shopping
- Browse **55 products** across 8 categories — Fruits, Vegetables, Dairy, Bakery, Beverages, Grains, Snacks, Pantry
- Real Indian brands — Amul, Tata, Britannia, Dabur, Haldiram's, Mother Dairy, Parle, and more
- Discount badges, out-of-stock labels, delivery time estimates per product
- Add to cart with live quantity controls — directly on product cards and detail pages

### 🔍 Products Page
- Sidebar filters — by category, price range (slider), in-stock only
- Sort by featured, price low/high, highest rated, best discount
- Live search with active filter tags and one-click removal
- URL-based filters — navigating from home/navbar pre-applies category or search

### 🛒 Cart
- Persistent cart via `localStorage` — survives page refresh and tab close
- Live totals — subtotal, 5% GST, ₹49 delivery fee (free above ₹499)
- Free delivery progress bar with animated fill
- Coupon codes — `ORGANIC10`, `FRESH20`, `FIRST50`
- Empty cart UI with CTA

### 💳 Checkout
- Delivery address display with change option
- Delivery slot selection — Express (45 mins) or Scheduled
- Payment method selection — UPI, Credit/Debit Card, Net Banking, Cash on Delivery
- Order summary with itemised list
- Animated order success modal with generated Order ID and redirect

### 🤍 Wishlist
- Save products across sessions
- Move to cart in one click
- Empty wishlist UI

### 👤 Auth — Login & Signup
- Split-panel layout — branded left panel, form right panel
- Tabbed toggle between Sign In and Create Account
- Full form validation with inline error messages
- Password strength meter (weak / fair / strong)
- Show/hide password toggle
- Indian mobile number validation
- Google and Phone OTP buttons (UI)
- Success state with auto-redirect

### 👤 Profile
- Overview with order stats and recent orders
- Full order history with status badges (Delivered, Processing, Cancelled)
- Saved addresses with default indicator
- Editable settings form with save confirmation

### 🔎 Navbar Search
- Live product search with image previews in dropdown
- Outside-click dismissal
- Enter key navigates to filtered Products page

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.js          # Fixed navbar with search, cart badge, mobile menu
│   ├── ProductCard.js     # Reusable card with cart/wishlist controls
│   └── Footer.js          # Site footer with links and newsletter
│
├── pages/
│   ├── Home.js            # Landing page — hero, categories, deals, featured
│   ├── Products.js        # Catalogue with filters, search, sort
│   ├── ProductDetail.js   # Single product — gallery, nutrition, related
│   ├── Cart.js            # Cart management and order summary
│   ├── Checkout.js        # Delivery, payment, order confirmation
│   ├── Wishlist.js        # Saved items
│   ├── Auth.js            # Login and signup
│   ├── Profile.js         # User dashboard
│   └── Contact.js         # Contact form and info
│
├── context/
│   └── CartContext.js     # Global cart + wishlist state via useReducer
│
├── data/
│   └── products.js        # All 55 products, 8 categories, banner data
│
├── styles/
│   ├── global.css         # Design tokens, animations, utility classes
│   ├── Navbar.css
│   ├── ProductCard.css
│   ├── Home.css
│   ├── ProductDetail.css
│   ├── Products.css
│   ├── Cart.css
│   ├── Checkout.css
│   ├── Wishlist.css
│   ├── Auth.css
│   ├── Profile.css
│   ├── Contact.css
│   └── Footer.css
│
├── App.js                 # Route definitions, provider setup
└── index.js               # React DOM entry point
```

---

## 🇮🇳 Indian Localisation

- All prices in **Indian Rupees (₹)**
- **5% GST** applied at checkout
- **₹49 delivery fee**, free above ₹499
- Indian mobile number validation (starts with 6–9, 10 digits)
- Indian addresses, phone numbers throughout
- Real Indian brands — Amul, Tata, Nandini, Britannia, Dabur, Haldiram's, Rajdhani, MDH, Parle, Kissan, Paperboat, Yoga Bar, and more
- GSTIN displayed in footer
- FSSAI licensing mentioned
- UPI / PhonePe / Google Pay as primary payment option

---

## 🎨 Design System

### Typography
- **Display** — Cormorant Garamond (serif, used for headings and prices)
- **Body** — Satoshi (modern sans-serif, used for all UI text)

### Colour Palette
| Token | Value | Use |
|---|---|---|
| `--green` | `#1a5c2e` | Primary brand colour |
| `--green-dark` | `#0f3d1e` | Hover states |
| `--green-light` | `#eaf4ed` | Backgrounds, badges |
| `--accent` | `#e8960c` | Gold accent, ratings |
| `--bg` | `#f5f7f2` | Page background |
| `--text-primary` | `#111810` | Main text |

### Animations
- Page entry `fadeUp` on cards and sections
- Staggered children via `.stagger` utility class
- Hero banner floating orb animation
- Shimmer sweep on delivery bar and progress fill
- Bounce transitions on wishlist and category cards
- Image zoom on hover across all product surfaces

---

## 🗂️ Product Catalogue

| Category | Count | Example Brands |
|---|---|---|
| Fruits | 7 | Ratnagiri Farms, Kerala Select, Nashik Valley |
| Vegetables | 8 | FarmFresh, Ooty Greens |
| Dairy | 8 | Amul, Mother Dairy, Nandini, Epigamia |
| Bakery | 7 | Britannia, The Baker's Dozen, Modern Bakery |
| Beverages | 8 | Tropicana, Chaayos, Paperboat, Raw Pressery |
| Grains | 8 | Tata, Quaker, Rajdhani, Aashirvaad |
| Snacks | 8 | Haldiram's, Yoga Bar, Happilo, Cornitos |
| Pantry | 8 | MDH, Dabur, Borges, Patanjali, Tata Sampann |

---

## ⚙️ Getting Started

### Prerequisites
- Node.js v16 or higher
- npm v8 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/organic-editorial.git

# Navigate into the project
cd organic-editorial

# Install dependencies
npm install

# Start the development server
npm start
```

The app opens at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Output is in the `/build` folder, ready for deployment to Vercel, Netlify, or any static host.

---

## 🧪 Test Coupon Codes

On the Cart page, try these codes:

| Code | Discount |
|---|---|
| `ORGANIC10` | ₹50 off |
| `FRESH20` | ₹80 off |
| `FIRST50` | ₹100 off |

---

## 📦 Local Product Images

If you want to use your own product images instead of external URLs, drop the image files into the `/public` folder and set the `image` field in `src/data/products.js` to just the filename:

```js
image: "pinksalt.jpg"  // resolves to public/pinksalt.jpg
```

The `resolveImage()` helper in `ProductCard.js` and `ProductDetail.js` automatically handles full URLs, bare filenames, and null values.

---

## 🗺️ Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/products` | Products catalogue |
| `/products?category=Fruits` | Pre-filtered catalogue |
| `/products?search=amul` | Pre-searched catalogue |
| `/product/:id` | Product detail |
| `/cart` | Shopping cart |
| `/checkout` | Checkout |
| `/wishlist` | Wishlist |
| `/login` | Login / Signup |
| `/profile` | User profile |
| `/contact` | Contact |

---

## 🔧 Customisation

### Adding a product
Open `src/data/products.js` and add an object to the `products` array:

```js
{
  id: 56,                          // unique id
  name: "Organic Turmeric Latte",
  brand: "Vahdam",
  category: "Beverages",           // must match a category name
  price: 349,
  originalPrice: 399,
  unit: "250g Tin",
  rating: 4.7,
  reviews: 234,
  image: "https://...",            // URL or filename in /public
  badge: "NEW",                    // or null
  badgeColor: "#1565c0",           // or null
  inStock: true,
  description: "...",
  farm: "Vahdam, Delhi",
  tags: ["beverage", "turmeric"],
  deliveryTime: "45 mins",
}
```

### Changing the GST rate
In `src/context/CartContext.js`, line 4:
```js
const GST_RATE = 0.05; // change to 0.12 for 12%
```

### Changing the free delivery threshold
In `src/context/CartContext.js`, line 6:
```js
const FREE_DELIVERY_THRESHOLD = 499; // change to any value
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">Built with 🌿 for conscious shoppers across India</p>
