const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const demoModal = document.querySelector('#demo-modal');
const demoForm = document.querySelector('[data-demo-form]');
const demoSuccess = document.querySelector('[data-form-success]');
const demoStatus = document.querySelector('[data-form-status]');
const heroDemoCta = document.querySelector('[data-hero-demo-cta]');

// Place your Google Apps Script Web App URL here (ends with /exec)
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycEFlRmunVb5N-lv3T85v4hFmq-4szdtgchzFDQWOM1szgiHApBcNhuQekI7PfuAo8-A/exec';

document.documentElement.classList.add('js');
document.querySelector('[data-year]').textContent = new Date().getFullYear();

function syncHeaderState() {
  header.classList.toggle('scrolled', window.scrollY > 20);

  if (!heroDemoCta) return;

  const heroDemoBottom = heroDemoCta.getBoundingClientRect().bottom;
  const revealOffset = header.offsetHeight + 12;
  header.classList.toggle('demo-cta-visible', heroDemoBottom <= revealOffset);
}

syncHeaderState();

window.addEventListener('scroll', syncHeaderState, { passive: true });
window.addEventListener('resize', syncHeaderState);

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  mobileMenu.classList.remove('open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  mobileMenu.classList.toggle('open', !isOpen);
});

mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

function openDemoForm(event) {
  event.preventDefault();
  closeMenu();
  demoStatus.textContent = '';
  demoSuccess.hidden = true;
  demoForm.hidden = false;

  if (typeof demoModal.showModal === 'function') {
    demoModal.showModal();
    document.body.classList.add('modal-open');
    demoModal.querySelector('input, select, textarea, button').focus();
  } else {
    window.location.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdk1GZJv_VOZ3ka8zGyh6AkQs2Nb2j9AURSbiq2v8atG0_xgQ/viewform?usp=dialog';
  }
}

function closeDemoForm() {
  demoModal.close();
  document.body.classList.remove('modal-open');
}

document.querySelectorAll('[data-demo-open]').forEach((trigger) => {
  trigger.addEventListener('click', openDemoForm);
});

document.querySelectorAll('[data-demo-close]').forEach((trigger) => {
  trigger.addEventListener('click', closeDemoForm);
});

demoModal.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
});

demoModal.addEventListener('click', (event) => {
  if (event.target === demoModal) closeDemoForm();
});

demoForm.addEventListener('submit', (event) => {
  event.preventDefault();

  // Validate form fields using browser native validation
  if (!demoForm.checkValidity()) {
    demoForm.reportValidity();
    return;
  }

  demoStatus.textContent = 'Sending your demo request...';
  demoStatus.style.color = ''; // Reset any error colors

  // Extract form data
  const formData = new FormData(demoForm);
  const data = {};
  const missedCalls = [];

  for (const [key, value] of formData.entries()) {
    if (key === 'missed_calls') {
      missedCalls.push(value);
    } else {
      data[key] = value;
    }
  }
  // Join checkbox values into a single comma-separated string
  data.missed_calls = missedCalls.join(', ');

  // If the Web App URL is not set, simulate submission for demo/testing purposes
  if (APPS_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn('Google Apps Script Web App URL is not configured. Simulating submission.');
    setTimeout(() => {
      demoForm.hidden = true;
      demoSuccess.hidden = false;
      demoStatus.textContent = '';
      demoForm.reset();
    }, 1200);
    return;
  }

  // Convert data to url-encoded format to prevent CORS preflight OPTIONS blockages
  const searchParams = new URLSearchParams();
  for (const key in data) {
    searchParams.append(key, data[key]);
  }

  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    body: searchParams,
    mode: 'no-cors' // Allows sending data securely without CORS issues on Google redirects
  })
    .then(() => {
      demoForm.hidden = true;
      demoSuccess.hidden = false;
      demoStatus.textContent = '';
      demoForm.reset();
    })
    .catch((error) => {
      console.error('Error submitting form:', error);
      demoStatus.textContent = 'There was an error sending your request. Please try again.';
      demoStatus.style.color = '#cc785c'; // Highlight error in brand coral color
    });
});



document.querySelectorAll('.accordion-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const willOpen = button.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.accordion-item button').forEach((other) => {
      other.setAttribute('aria-expanded', 'false');
      other.closest('.accordion-item').querySelector('.accordion-panel').hidden = true;
    });
    if (willOpen) {
      button.setAttribute('aria-expanded', 'true');
      button.closest('.accordion-item').querySelector('.accordion-panel').hidden = false;
    }
  });
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('visible'));
}
