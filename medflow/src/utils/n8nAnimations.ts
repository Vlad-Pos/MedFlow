/**
 * n8n.io-inspired animations and scroll effects
 * Based on the visual package provided for MedFlow redesign
 */

// Scroll animation
export const initScrollAnimations = () => {
  const handleScroll = () => {
    document.querySelectorAll('.fade-in').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('visible');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  
  // Initial check for elements already in view
  handleScroll();
  
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// GSAP animations for hero section
export const initHeroAnimations = async () => {
  try {
    const { gsap } = await import('gsap');
    
    gsap.from(".hero-title", { 
      duration: 1, 
      y: 50, 
      opacity: 0, 
      ease: "power3.out",
      delay: 0.2
    });
    
    gsap.from(".fade-in", {
      duration: 0.8,
      y: 30,
      opacity: 0,
      stagger: 0.1,
      ease: "power2.out"
    });
  } catch (error) {
    console.log('GSAP not available, falling back to CSS animations');
  }
};

// Enhanced scroll-triggered animations with intersection observer
export const initIntersectionAnimations = () => {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  document.querySelectorAll('.fade-in').forEach((el) => {
    observer.observe(el);
  });

  return () => {
    observer.disconnect();
  };
};

// Initialize all animations
export const initAllAnimations = () => {
  const cleanupFunctions: (() => void)[] = [];
  
  cleanupFunctions.push(initScrollAnimations());
  cleanupFunctions.push(initIntersectionAnimations() || (() => {}));
  initHeroAnimations();
  
  return () => {
    cleanupFunctions.forEach(cleanup => cleanup());
  };
};
