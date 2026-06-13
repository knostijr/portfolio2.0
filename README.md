# Christoph Konst – Portfolio

Personal portfolio website built with **Vite + TypeScript + SCSS**.

## Tech Stack

- **Vite** – Build tool & dev server
- **TypeScript** – Type-safe JavaScript
- **SCSS** – Modular CSS with variables & mixins
- **Vanilla JS** – No framework overhead
- **PHP** – Lightweight mail backend for the contact form

## Project Structure

```
portfolio/
├── public/
│   ├── impressum.html        # Legal notice (Impressum)
│   ├── datenschutz.html      # Privacy policy
│   └── send_mail.php         # Contact form mail backend
├── src/
│   ├── styles/
│   │   ├── _variables.scss   # Colors, fonts, spacing, breakpoints
│   │   ├── _reset.scss       # CSS reset & base styles
│   │   ├── _mixins.scss      # Reusable SCSS mixins
│   │   └── main.scss         # All component styles + animations
│   ├── ts/
│   │   ├── navigation.ts     # Sticky nav, mobile menu, smooth scroll
│   │   ├── ticker.ts         # Diagonal marquee ticker
│   │   ├── testimonials.ts   # Carousel with cloned slides & autoplay
│   │   ├── contact.ts        # Form validation & async submission
│   │   ├── scroll-reveal.ts  # Intersection Observer reveal animations
│   │   ├── language.ts       # German / English translation toggle
│   │   └── projects.ts       # Hover preview & details modal
│   ├── main.ts               # Entry point – initializes all modules
│   ├── vite-env.d.ts         # Vite client type declarations
│   ├── index.html
│   ├── favicon.svg
│   ├── chris.png             # Profile photo
│   ├── bestellapp.png        # Project screenshot
│   ├── join.png              # Project screenshot
│   └── pokedex.png           # Project screenshot
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production → creates /dist folder
npm run build

# Preview production build locally
npm run preview
```

## Customization

### Personal Info
Edit `src/index.html`:
- Update name, role, intro text
- Replace email, GitHub, LinkedIn and other social links
- Edit project titles, descriptions and tech tags
- Update testimonial quotes

Most copy is bilingual via `data-lang-de` / `data-lang-en` attributes –
make sure to update **both** when editing text.

### Profile & Project Images
Replace the existing PNGs in `src/`:
- `chris.png` – Your profile photo
- `bestellapp.png`, `join.png`, `pokedex.png` – Project screenshots

### Colors & Fonts
Edit `src/styles/_variables.scss` to change accent color, background,
typography, spacing, breakpoints, etc.

### Contact Form Recipient
Edit `public/send_mail.php`:

```php
$TO_EMAIL = 'your-email@example.com';
$SUBJECT  = 'Your custom subject';
```

The PHP script handles server-side validation (name, email, message, privacy
consent) and prevents mail header injection. It returns JSON, which
`contact.ts` consumes to show success/error feedback.

## Deployment

After `npm run build`, the `dist/` folder contains the static site **plus**
`send_mail.php` (copied from `public/`).

### Recommended: classic PHP hosting
Upload the contents of `dist/` via SFTP/FTP to a host that supports PHP
(e.g. Netcup, Strato, IONOS, Hetzner, All-Inkl). The contact form will work
out of the box.

### Alternative: Vercel / Netlify (no PHP)
Static deployment works for everything **except** the contact form –
`send_mail.php` won't be executed. Either:
- Disable the contact form, or
- Replace the PHP backend with a service like Formspree, EmailJS, or
  a serverless function (Vercel Functions, Netlify Functions).

## License

Personal portfolio project. All photos and content © Christoph Konst.
