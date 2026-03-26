# Gaming Hub: Xbox Games & Subscriptions

This directory contains a simple static website showcasing featured Xbox games and summarising Microsoft’s current Game Pass tiers as of early 2026.

## Contents

- `index.html` — the main page with navigation, a hero section, featured games, subscription tables, and a contact section.
- `style.css` — styles for the layout, typography and colours.
- `assets/hero.png` — a decorative abstract background used in the hero section.

## Running locally

To view the site locally:

1. Make sure you have a modern web browser installed.
2. Copy the entire `xbox_site` directory to your machine.
3. Open `index.html` in your browser.

## Deploying with GitHub Pages

Follow these steps to host the site using GitHub Pages (a free static hosting service by GitHub):

1. **Create a GitHub account** if you don’t already have one.
2. **Create a new repository**. You can name it `username.github.io` to host at the root domain or choose another name (e.g. `xbox-store`) to host at `https://username.github.io/xbox-store`.
3. **Upload the files** in this directory to the repository. You can drag‑and‑drop them on GitHub’s website or use `git`:

   ```bash
   git init
   git add .
   git commit -m "Initial commit of Gaming Hub site"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository’s **Settings**.
   - Navigate to **Pages** in the sidebar.
   - Under **Build and deployment**, choose **Deploy from a branch**.
   - Select the `main` branch and the `/` (root) folder.
   - Save. After a moment, GitHub will provide a live URL where your site is hosted.

5. **Visit your site** using the provided GitHub Pages URL. Any future changes you push to the repository will automatically update the live site.

## Customising

Feel free to modify the HTML, CSS or add more assets. You can expand the games list, adjust the styling, or add new pages. To change the hero background, replace `assets/hero.png` with your own image and update the `background-image` property in `style.css`.

## Disclaimer

This site is a demonstration and does not process payments. For commercial use, you would need to integrate secure payment processing and ensure compliance with relevant policies.