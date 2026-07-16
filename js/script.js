// reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// unit tabs
document.querySelectorAll('.unit-tab').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.unit-tab').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    document.querySelectorAll('.unit-card').forEach((c) => c.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    document.getElementById('unit-' + btn.dataset.unit).classList.add('active');
  });
});

// mobile nav
const navToggle = document.getElementById('navToggle');
const mobileNav = document.getElementById('mobileNav');
navToggle.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});
mobileNav.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    mobileNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});
