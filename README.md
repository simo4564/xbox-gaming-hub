# Gaming Hub: Enhanced Xbox Games &amp; Game Pass Guide

This directory contains an **enhanced** static website that showcases standout Xbox titles, highlights upcoming day‑one Game Pass releases and summarises Microsoft’s current Game Pass tiers as of early 2026. The layout has been reimagined with a modern dark theme, responsive cards and an optional contact form.

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

## Disclaimer

This site is a demonstration and does not process payments. For commercial use, you would need to integrate secure payment processing, user authentication and ensure compliance with relevant policies.