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

  /* Load more functionality */
  const loadMoreBtn = document.getElementById('load-more');
  if (loadMoreBtn) {
    const cards = Array.from(document.querySelectorAll('#games .card'));
    let visibleCount = 4;
    function updateVisibility() {
      cards.forEach((card, index) => {
        card.style.display = index < visibleCount ? 'flex' : 'none';
      });
      loadMoreBtn.style.display = visibleCount >= cards.length ? 'none' : 'block';
    }
    updateVisibility();
    loadMoreBtn.addEventListener('click', () => {
      visibleCount += 4;
      updateVisibility();
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