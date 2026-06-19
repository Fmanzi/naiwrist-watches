# ShopExpress - eCommerce Website

A fully customizable, data-driven eCommerce website template. Built with vanilla HTML, CSS, and JavaScript. No backend required — deploy to GitHub Pages and start selling.

## Features

- Product catalog loaded from JSON
- Category filtering + search
- Grid / List view toggle
- Hero banner carousel with auto-loop
- Quick view modal with image gallery (swipe on mobile)
- Shopping cart (localStorage)
- WhatsApp order checkout
- Mobile-responsive design
- Payment badges: M-Pesa, Airtel Money, Kenyan Bank Transfer

## How to Customize for Your Store

### 1. Edit Store Settings

Open `assets/js/config.json`:

```json
{
  "storeName": "ShopExpress",
  "currency": "Ksh",
  "whatsappNumber": "0728580415",
  "whatsappPrefix": "254",
  "banners": [...],
  "categories": [...]
}
```

| Field | Description |
|---|---|
| `storeName` | Your store name |
| `currency` | Currency symbol (e.g. Ksh, $) |
| `whatsappNumber` | Your WhatsApp number (digits only) |
| `whatsappPrefix` | Country code without `+` (e.g. 254 for Kenya) |
| `banners` | Array of hero banner slides |
| `categories` | Product category names |

### 2. Add Products

Open `assets/js/products.json`. Each product has this structure:

```json
{
  "id": 1,
  "name": "Dell XPS 15",
  "category": "Ultrabooks",
  "price": 1299.00,
  "comparePrice": 1499.00,
  "images": [
    "https://picsum.photos/seed/dell-xps15/400/400",
    "https://picsum.photos/seed/dell-xps15-2/400/400",
    "https://picsum.photos/seed/dell-xps15-3/400/400",
    "https://picsum.photos/seed/dell-xps15-4/400/400"
  ],
  "description": "Intel Core i7-13700H, 16GB DDR5, 512GB SSD..."
}
```

- `id` must be unique
- `category` must match one in `config.json`
- `comparePrice` is optional (set to 0 or omit for no discount display)
- `images` — replace `picsum.photos` URLs with your actual product images
- `description` — shown in the quick view modal

### 3. Replace Images

- **Product images**: Replace the `images` array URLs in `products.json` with your own images
- **Banner images**: Replace `./assets/images/banner-1.jpg`, `banner-2.jpg`, `banner-3.jpg`
- **Store logo**: Replace `./assets/images/logo/logo.svg`
- **Favicon**: Replace `./assets/images/logo/favicon.ico`
- **Newsletter image**: Replace `./assets/images/newsletter.png` (or keep as-is)

### 4. Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Then go to your repo **Settings > Pages**, select `main` branch as source, and save.

Your site will be live at `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### 5. How Orders Arrive

When a customer fills in the checkout form and clicks **Place Order via WhatsApp**, the order details are sent directly to your WhatsApp number via a `wa.me` link. No email or backend needed.

### 6. File Structure

```
├── index.html              # Main HTML
├── assets/
│   ├── css/
│   │   └── style.css       # All styles
│   ├── js/
│   │   ├── script.js        # E-commerce logic
│   │   ├── checkout.js      # WhatsApp order handler
│   │   ├── config.json      # Store configuration
│   │   └── products.json    # Product catalog
│   └── images/
│       ├── banner-*.jpg     # Hero banner images
│       ├── logo/            # Store logo + favicon
│       └── newsletter.png   # Newsletter modal image
```

## Troubleshooting

**Products not showing?** Check that `config.json` and `products.json` are valid JSON (use [jsonlint.com](https://jsonlint.com)).

**WhatsApp link not working?** Make sure `whatsappNumber` contains only digits and `whatsappPrefix` is the correct country code (254 for Kenya).

## License

MIT
