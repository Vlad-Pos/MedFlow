
// Scroll animation
window.addEventListener('scroll', () => {
  document.querySelectorAll('.fade-in').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      el.classList.add('visible');
    }
  });
});

// GSAP example for hero section
if (window.gsap) {
  gsap.from(".hero-title", { duration: 1, y: 50, opacity: 0, ease: "power3.out" });
}
