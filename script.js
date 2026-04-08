/* ========================================
   MINIMALIST PORTFOLIO
   Interactive Carousel Gallery
   Manual Navigation + Infinite Loop
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initializeScrollAnimations();
    initializeGlassLayerParallax();
});

/* ========================================
   STACKED CARD CAROUSEL
   Manual navigation with infinite loop
   3D depth effect and smooth animations
   ======================================== */

function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    const prevBtn = document.querySelector('.carousel-nav-prev');
    const nextBtn = document.querySelector('.carousel-nav-next');

    if (!carousel || !prevBtn || !nextBtn) return;

    const items = document.querySelectorAll('.carousel-item');
    if (items.length === 0) return;

    let currentIndex = 0;
    const itemCount = items.length;
    let isAnimating = false;

    // Initialize card positions
    function updateCardPositions() {
        items.forEach((item, index) => {
            // Remove all position classes
            item.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next', 'hidden');

            // Calculate relative position from current index
            let relativePosition = index - currentIndex;

            // Handle wrapping for infinite loop
            if (relativePosition > itemCount / 2) {
                relativePosition -= itemCount;
            } else if (relativePosition < -itemCount / 2) {
                relativePosition += itemCount;
            }

            // Apply position class based on relative position
            switch (relativePosition) {
                case 0:
                    item.classList.add('active');
                    break;
                case -1:
                    item.classList.add('prev');
                    break;
                case 1:
                    item.classList.add('next');
                    break;
                case -2:
                    item.classList.add('far-prev');
                    break;
                case 2:
                    item.classList.add('far-next');
                    break;
                default:
                    item.classList.add('hidden');
            }
        });
    }

    // Transition to a specific index
    function goToIndex(newIndex) {
        if (isAnimating) return;
        isAnimating = true;

        // Infinite loop wrapping
        currentIndex = ((newIndex % itemCount) + itemCount) % itemCount;

        // Update all card positions with animation
        updateCardPositions();

        // Unlock after animation completes
        setTimeout(() => {
            isAnimating = false;
        }, 600);
    }

    // Next button - move to next card
    nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToIndex(currentIndex + 1);
    });

    // Previous button - move to previous card
    prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        goToIndex(currentIndex - 1);
    });

    // Touch/Swipe support for mobile
    let touchStartX = 0;
    let touchStartY = 0;

    carousel.addEventListener('touchstart', (e) => {
        if (isAnimating) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, false);

    carousel.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
    }, false);

    function handleSwipe(startX, endX, startY, endY) {
        const swipeThreshold = 50;
        const diffX = startX - endX;
        const diffY = Math.abs(startY - endY);

        // Only process horizontal swipes (ignore vertical scrolls)
        if (Math.abs(diffX) > swipeThreshold && diffY < 100) {
            if (diffX > 0) {
                // Swiped left - show next
                goToIndex(currentIndex + 1);
            } else {
                // Swiped right - show previous
                goToIndex(currentIndex - 1);
            }
        }
    }

    // Keyboard navigation (arrow keys)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextBtn.click();
        } else if (e.key === 'ArrowLeft') {
            prevBtn.click();
        }
    });

    // Initialize first position
    updateCardPositions();
}

/* ========================================
   GLASS LAYER PARALLAX SCROLL EFFECT
   Smooth upward movement of unified container
   Creates layered/parallax effect with background
   ======================================== */

function initializeGlassLayerParallax() {
    const glassLayer = document.querySelector('.unified-glass-layer');
    const heroSection = document.querySelector('.hero');
    
    if (!glassLayer || !heroSection) return;

    function updateGlassLayerPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const heroHeight = heroSection.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        // Show ~42% of container on initial load (slightly more for peek effect into hero)
        const containerVisiblePercent = 0.42;
        const containerVisibleHeight = Math.min(viewportHeight * containerVisiblePercent, 480);
        
        // Calculate initial position to show container peeking into hero on initial load
        // Position container so exact amount is visible at bottom of viewport
        const initialTopPosition = viewportHeight - containerVisibleHeight;
        
        // As you scroll, container moves up at 1x scroll speed (parallax effect)
        const parallaxFactor = 1;
        const newTop = Math.max(heroHeight, initialTopPosition - (scrollTop * parallaxFactor));
        
        glassLayer.style.top = `${newTop}px`;
    }

    // Smooth scroll listener with RAF
    let ticking = false;
    const scrollListener = () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateGlassLayerPosition();
                ticking = false;
            });
            ticking = true;
        }
    };

    window.addEventListener('scroll', scrollListener, { passive: true });

    // Handle resize
    let resizeTimer;
    const resizeListener = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateGlassLayerPosition();
        }, 100);
    };
    
    window.addEventListener('resize', resizeListener);

    // Initial position
    updateGlassLayerPosition();
}

/* ========================================
   SCROLL ANIMATIONS
   Elements animate on scroll into view
   ======================================== */

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe sections
    document.querySelectorAll('.intro-section, .content-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

/* ========================================
   UTILITIES
   ======================================== */

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
}