// Southwest Lawn & Garden — site interactions

const header = document.getElementById('siteHeader');
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('mainNav');

// Header background on scroll
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile navigation toggle
navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Contact form -> open default email client with quote request
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent('New Quote Request from ' + (data.get('name') || 'Website visitor'));
  const body = encodeURIComponent(
    'Name: ' + (data.get('name') || '') + '\n' +
    'Phone: ' + (data.get('phone') || '') + '\n' +
    'Service: ' + (data.get('service') || '') + '\n' +
    'Message: ' + (data.get('message') || '')
  );
  window.location.href = 'mailto:hello@southwestlawn.com?subject=' + subject + '&body=' + body;
});
