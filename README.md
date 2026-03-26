# Gaming Hub: Enhanced Xbox Games &amp; Game Pass Guide

This directory contains an **enhanced** static website that showcases standout Xbox titles, highlights upcoming day‑one Game Pass releases and summarises Microsoft’s current Game Pass tiers as of early 2026. The layout has been reimagined with a modern dark theme, responsive cards and an optional contact form. Each featured game card now includes an **Add to Cart** button powered by **Snipcart**, so visitors can build a shopping cart and check out without leaving your site (once you provide a valid Snipcart API key). A **Join Game Pass** button remains below the plans table for those who want to subscribe directly through Microsoft.

## Contents

- `index.html` — the main page with a hero banner, navigation, a **Featured Games** section, an **Upcoming Releases** section, updated **Game Pass Plans** and a contact form.
- `style.css` — styles for the new dark layout, modern typography and responsive cards.
- `assets/hero.png` — a decorative abstract background used in the hero section (feel free to replace this image).

## Running locally

To view the site locally:

1. Make sure you have a modern web browser installed.
2. Copy the entire `xbox_site_enhanced` directory to your machine.
3. Open `index.html` in your browser.

## Deploying with GitHub Pages

Follow these steps to host the site using **GitHub Pages**, GitHub’s free static hosting service:

1. **Create a GitHub account** if you don’t already have one.
2. **Create a new repository**. You can name it `username.github.io` to host at the root domain or choose another name (e.g. `xbox-gaming-hub`) to host at `https://username.github.io/xbox-gaming-hub`.
3. **Upload the files** from this directory to your repository. You can drag‑and‑drop them on GitHub’s website or use the command line:

   ```bash
   git init
   git add .
   git commit -m "Initial commit of enhanced Gaming Hub"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository’s **Settings**.
   - Navigate to **Pages** in the sidebar.
   - Under **Build and deployment**, choose **Deploy from a branch**.
   - Select the `main` branch and the `/` (root) folder.
   - Save. After a few seconds, GitHub will provide a live URL where your site is hosted.

5. **Visit your site** using the provided GitHub Pages URL. Any future changes you push to the repository will automatically update the live site.

## Customising

Feel free to modify the HTML or CSS to suit your needs. You can expand the games list, add your own upcoming release cards, adjust colours or typography, or even create additional pages. To change the hero background, replace `assets/hero.png` with your own image and update the `background-image` property in `style.css`.

## Integrating Snipcart for E‑Commerce

This site uses [Snipcart](https://snipcart.com/) to enable in‑page purchases and a shopping cart. Snipcart is a plug‑and‑play ecommerce platform that works on static sites. The provided `index.html` already includes Snipcart’s stylesheet and JavaScript, plus a hidden `<div id="snipcart">` placeholder. To make the cart functional:

1. **Create a Snipcart account** at [snipcart.com](https://snipcart.com) and copy your **public API key** from the dashboard.
2. In `index.html`, locate the line near the bottom that reads `data-api-key="YOUR_PUBLIC_API_KEY"` and replace `YOUR_PUBLIC_API_KEY` with your actual public API key. Do **not** share or commit your secret API key.
3. Configure payment gateways and shipping settings in the Snipcart dashboard. Snipcart supports Stripe, PayPal and other processors.
4. Each **Add to Cart** button has `data-item-*` attributes that define the product ID, name, price and description. You can adjust these values or add new products by following the same pattern. See Snipcart’s documentation for additional options, such as specifying item URLs, images or downloadable files.

Until you provide a valid API key and configure a payment gateway, checkout will run in **test mode** and display a demo payment form. Replace the placeholder key and adjust product prices to reflect your own offerings before going live.

## Disclaimer

The included purchase buttons simply link to Microsoft’s official store pages for each game and a general sign‑up page for Game Pass. No payment information is collected or processed by this site. For fully integrated ecommerce (e.g., selling your own digital keys directly), you would need to set up secure payment processing and user authentication separately and ensure compliance with relevant policies.