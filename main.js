/* ── NAV SCROLL ───────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ── MOBILE NAV TOGGLE ────────────────────────── */
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ── COUNTER ANIMATION ────────────────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, 16);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

/* ── SCROLL REVEAL ────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (entry.target.dataset.delay || 0));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

/* Add reveal class to key elements */
const revealTargets = [
  '.section-label', '.section-title', '.philosophy-text',
  '.philosophy-pillars', '.service-card', '.founder-card',
  '.client-type', '.track-stat', '.contact-block', '.pillar'
];
revealTargets.forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add('reveal');
    el.dataset.delay = (i % 4) * 80;
    revealObserver.observe(el);
  });
});

/* ── FORM SUBMISSION ──────────────────────────── */
window.handleSubmit = function() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const category = document.getElementById('category').value;
  const message  = document.getElementById('message').value.trim();

  if (!name || !email || !category || !message) {
    alert('Please fill in all fields before submitting.');
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  // Simulate submission (replace with your backend endpoint)
  const btn = document.getElementById('submitBtn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = 'Send Enquiry';
    btn.disabled = false;

    // Clear form
    ['name','email','message'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('category').value = '';

    // Show toast
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 5000);
  }, 1200);
};

/* ── ACTIVE NAV HIGHLIGHT ─────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--ivory)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// FAQ Accordion

document.querySelectorAll(".faq-question").forEach((question) => {
  question.addEventListener("click", () => {
    const item = question.parentElement;

    document.querySelectorAll(".faq-item").forEach((faq) => {
      if (faq !== item) {
        faq.classList.remove("active");
      }
    });

    item.classList.toggle("active");
  });
});