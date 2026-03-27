// Interactivity and animations for Gaming Hub
document.addEventListener('DOMContentLoaded', () => {
  /* Theme toggle handling */
  const toggleButton = document.getElementById('theme-toggle');
  const themeIcon = toggleButton ? toggleButton.querySelector('i') : null;
  const currentTheme = localStorage.getItem('theme') || 'dark';

  function applyTheme(theme) {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      if (themeIcon) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    } else {
      document.body.classList.remove('light-theme');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    }
    localStorage.setItem('theme', theme);
  }

  applyTheme(currentTheme);
  if (toggleButton) {
    toggleButton.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
      applyTheme(newTheme);
    });
  }

  /* Game search filter */
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const cards = document.querySelectorAll('#games .card');
      cards.forEach(card => {
        const title = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('p').textContent.toLowerCase();
        if (title.includes(query) || desc.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  /* Load more functionality
   * Keep a reference to all game cards so that other features (sorting, filtering)
   * can re‑use the same collection. We expose the updateVisibility function
   * so that it can be called when cards are re‑ordered or when new cards are
   * displayed. By default, only the first four cards are visible; clicking
   * the “Load More” button reveals four more at a time. When the card order
   * changes (through sorting or filtering), we hide the Load More button and
   * show all filtered cards. */
  const loadMoreBtn = document.getElementById('load-more');
  let gameCards = Array.from(document.querySelectorAll('#games .card'));
  let visibleCount = 4;
  function updateVisibility() {
    gameCards.forEach((card, index) => {
      card.style.display = index < visibleCount ? 'flex' : 'none';
    });
    if (loadMoreBtn) {
      loadMoreBtn.style.display = visibleCount >= gameCards.length ? 'none' : 'block';
    }
  }
  if (loadMoreBtn) {
    updateVisibility();
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += 4;
      updateVisibility();
    });
  }

  /* Sorting and category filtering
   * Users can sort games by price, rating or name and filter by genre. When
   * either select changes, we rebuild the card list in the chosen order and
   * hide the Load More button so all matching games are visible. */
  const sortSelect = document.getElementById('sort-select');
  const categorySelect = document.getElementById('category-filter');
  const cardsContainer = document.querySelector('#games .card-grid');
  function applySortFilter() {
    if (!cardsContainer) return;
    const category = categorySelect ? categorySelect.value : 'all';
    const sortOption = sortSelect ? sortSelect.value : 'default';
    // Start from original order by referencing gameCards array
    let filtered = gameCards.filter(card => {
      return category === 'all' || card.dataset.category === category;
    });
    // Sorting logic
    filtered.sort((a, b) => {
      if (sortOption === 'price-asc' || sortOption === 'price-desc') {
        const priceA = parseFloat(a.querySelector('.snipcart-add-item').dataset.itemPrice);
        const priceB = parseFloat(b.querySelector('.snipcart-add-item').dataset.itemPrice);
        return sortOption === 'price-asc' ? priceA - priceB : priceB - priceA;
      }
      if (sortOption === 'rating-asc' || sortOption === 'rating-desc') {
        const ratingA = parseFloat(a.dataset.rating);
        const ratingB = parseFloat(b.dataset.rating);
        return sortOption === 'rating-asc' ? ratingA - ratingB : ratingB - ratingA;
      }
      if (sortOption === 'alpha') {
        const nameA = a.querySelector('h3').textContent.trim().toLowerCase();
        const nameB = b.querySelector('h3').textContent.trim().toLowerCase();
        return nameA.localeCompare(nameB);
      }
      // Default: preserve original order by comparing indices in gameCards
      return gameCards.indexOf(a) - gameCards.indexOf(b);
    });
    // Rebuild DOM
    cardsContainer.innerHTML = '';
    filtered.forEach(card => cardsContainer.appendChild(card));
    // Update the gameCards reference to the new order
    gameCards = Array.from(cardsContainer.children);
    // Reveal all filtered results and hide the load more button
    visibleCount = gameCards.length;
    updateVisibility();
  }
  if (sortSelect) sortSelect.addEventListener('change', applySortFilter);
  if (categorySelect) categorySelect.addEventListener('change', applySortFilter);

  /* Wishlist functionality
   * Users can click the heart icon on any game card to save it to their
   * personal wishlist. The wishlist is stored in localStorage so it
   * persists between visits. The wishlist section at the bottom of the page
   * displays all saved items and allows removal. */
  const wishlistBtns = document.querySelectorAll('.wishlist-btn');
  const wishlistContainerEl = document.getElementById('wishlist-items');
  const wishlistEmptyEl = document.querySelector('#wishlist .wishlist-empty');
  // Load saved wishlist or start with empty array
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  // Helper functions
  const saveWishlist = () => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  };
  const findWishlistIndex = id => wishlist.findIndex(item => item.id === id);
  const updateWishlistDisplay = () => {
    if (!wishlistContainerEl) return;
    wishlistContainerEl.innerHTML = '';
    if (wishlist.length === 0) {
      if (wishlistEmptyEl) wishlistEmptyEl.style.display = 'block';
      return;
    }
    if (wishlistEmptyEl) wishlistEmptyEl.style.display = 'none';
    wishlist.forEach(item => {
      const card = document.createElement('div');
      card.classList.add('card');
      card.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="price">$${parseFloat(item.price).toFixed(2)}</div>
        <button class="wishlist-remove" data-id="${item.id}" aria-label="Remove from wishlist">
          <i class="fas fa-trash"></i>
        </button>
      `;
      wishlistContainerEl.appendChild(card);
    });
  };
  // Initialize heart states and attach click events
  wishlistBtns.forEach(btn => {
    const card = btn.closest('.card');
    const addBtn = card ? card.querySelector('.snipcart-add-item') : null;
    if (!addBtn) return;
    const itemId = addBtn.dataset.itemId;
    // Set active state if item already in wishlist
    if (wishlist.some(item => item.id === itemId)) {
      btn.classList.add('active');
    }
    btn.addEventListener('click', () => {
      // Toggle active class
      btn.classList.toggle('active');
      const index = findWishlistIndex(itemId);
      if (index === -1) {
        // Add item to wishlist
        wishlist.push({
          id: itemId,
          name: addBtn.dataset.itemName,
          price: addBtn.dataset.itemPrice,
          description: addBtn.dataset.itemDescription
        });
      } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
      }
      saveWishlist();
      updateWishlistDisplay();
    });
  });
  // Display wishlist on load
  updateWishlistDisplay();
  // Remove items when clicking trash icon (delegation)
  if (wishlistContainerEl) {
    wishlistContainerEl.addEventListener('click', event => {
      const removeBtn = event.target.closest('.wishlist-remove');
      if (removeBtn) {
        const id = removeBtn.dataset.id;
        // Remove from wishlist array
        const idx = findWishlistIndex(id);
        if (idx !== -1) {
          wishlist.splice(idx, 1);
          saveWishlist();
          updateWishlistDisplay();
          // Also update heart icon in game card
          document.querySelectorAll('.wishlist-btn').forEach(button => {
            const card = button.closest('.card');
            const addBtn = card.querySelector('.snipcart-add-item');
            if (addBtn.dataset.itemId === id) {
              button.classList.remove('active');
            }
          });
        }
      }
    });
  }

  /* Smooth scrolling for navigation */
  document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* Hero fade-in animation */
  const heroOverlay = document.querySelector('.hero-overlay');
  if (heroOverlay) {
    heroOverlay.style.opacity = 0;
    setTimeout(() => {
      heroOverlay.style.transition = 'opacity 1.2s ease';
      heroOverlay.style.opacity = 1;
    }, 100);
  }

  /* Intersection observer for fade-in elements and counters */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Start counters within this element
        const counters = entry.target.querySelectorAll('.counter');
        counters.forEach(counter => {
          const targetValue = parseFloat(counter.getAttribute('data-target'));
          const duration = 1500; // total duration in ms
          const startTime = performance.now();
          function updateCounter(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            let value = targetValue * progress;
            // Determine decimals based on target value
            if (targetValue < 10 && targetValue % 1 !== 0) {
              counter.textContent = value.toFixed(1);
            } else {
              counter.textContent = Math.floor(value);
            }
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }
          requestAnimationFrame(updateCounter);
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));
  document.querySelectorAll('#stats .stat').forEach(el => observer.observe(el));

  /* Scroll-to-top button */
  const scrollBtn = document.getElementById('scroll-top');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollBtn.style.display = 'block';
      } else {
        scrollBtn.style.display = 'none';
      }
    });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Cookie banner */
  const cookieBanner = document.getElementById('cookie-banner');
  const acceptCookiesBtn = document.getElementById('accept-cookies');
  if (cookieBanner && acceptCookiesBtn) {
    if (!localStorage.getItem('cookiesAccepted')) {
      cookieBanner.style.display = 'block';
    }
    acceptCookiesBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'yes');
      cookieBanner.style.display = 'none';
    });
  }

  /* Contact form submission */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', event => {
      event.preventDefault();
      const success = document.createElement('p');
      success.textContent = 'Thanks for reaching out! We will respond soon.';
      success.style.color = 'var(--primary-color)';
      contactForm.appendChild(success);
      contactForm.reset();
    });
  }

  /* Newsletter subscription form */
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', event => {
      event.preventDefault();
      const input = newsletterForm.querySelector('input[type="email"]');
      const message = document.createElement('p');
      message.textContent = 'Thanks for subscribing! Check your inbox for updates.';
      message.style.color = 'var(--primary-color)';
      newsletterForm.parentElement.appendChild(message);
      input.value = '';
    });
  }
});