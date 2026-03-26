# Gaming Hub: Enhanced Xbox Games &amp; Game Pass Guide

This directory contains a **massively enhanced** static website that showcases standout Xbox titles, highlights upcoming day‑one Game Pass releases and summarises Microsoft’s current Game Pass tiers as of early 2026. The layout has been reimagined with a modern dark theme, responsive cards and a host of new interactive elements including a theme‑toggle switch, search filtering, ratings, load‑more functionality and animated stats. We’ve also added dedicated sections for testimonials, a video trailer, a newsletter sign‑up, an FAQ, and more. Each featured game card includes an **Add to Cart** button powered by **Snipcart**, so visitors can build a shopping cart and check out without leaving your site (once you provide a valid Snipcart API key). A **Join Game Pass** button remains below the plans table for those who want to subscribe directly through Microsoft.

## Contents

In addition to the original files, this version introduces extra assets and scripts:

- `index.html` — the main page with a hero banner, navigation, a **Featured Games** section, an **Upcoming Releases** section, updated **Game Pass Plans**, testimonials, a video trailer, stats counters, newsletter sign‑up, FAQ and a contact form.
- `style.css` — styles for the dark/light theme, modern typography, responsive cards and animations.
- `script.js` — JavaScript that powers the search filter, theme toggle, load‑more feature, scroll animations, animated counters, countdown timers, scroll‑to‑top button and cookie banner.
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

### Obtaining a Live API key

Snipcart uses two environments: **Test** and **Live**. When you’re ready to accept real payments, log in to your Snipcart dashboard, toggle **Live mode** (top centre of the dashboard) and copy your **Live API key** from **Account → API keys**. Replace the `data-api-key` value in your HTML with this live key. According to Snipcart’s documentation, switching to live mode and using your Live API key is required before real orders appear in your dashboard【479351639003140†L65-L78】.

## Video Trailer Embed

The “Watch Our Trailer” section uses an `<iframe>` to embed a YouTube video. Some official trailers do not allow embedding or may be restricted in certain regions, which is why the initial embed might display a “Video unavailable” message. We’ve replaced the original embed with a publicly accessible YouTube demo video (from the IFrame API sample) as a placeholder. To feature your own trailer, edit `index.html` and change the `src` of the `<iframe>` in the **Video Section** to the embed URL of any YouTube video that permits embedding. For example:

```html
<!-- Example embed replacement -->
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID?rel=0" title="Your Game Trailer" frameborder="0" allowfullscreen></iframe>
```

Replace `VIDEO_ID` with the identifier from the YouTube video’s URL.

## Disclaimer

The included purchase buttons simply link to Microsoft’s official store pages for each game and a general sign‑up page for Game Pass. No payment information is collected or processed by this site. For fully integrated ecommerce (e.g., selling your own digital keys directly), you would need to set up secure payment processing and user authentication separately and ensure compliance with relevant policies.