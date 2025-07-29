'use strict';
(() => {
    // Cache all frequently accessed DOM elements for performance
    const DOM = {
        preloader: document.getElementById('preloader'),
        header: document.getElementById('main-header'),
        heroTitle: document.getElementById('hero-title'),
        animatedElements: document.querySelectorAll('[data-animate]'),
        contactForm: document.getElementById('contact-form'),
        feedbackModal: document.getElementById('feedback-modal'),
        closeModalBtn: document.getElementById('close-modal-btn'),
    };

    // Hold stateful values for things like scroll position
    const state = {
        lastScrollY: window.scrollY,
        isTicking: false
    };

    // Store configuration values
    const config = {
        headerHeight: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 80
    };

    // Manages the preloader screen
    const PreloaderModule = {
        init() {
            window.addEventListener('load', () => DOM.preloader?.classList.add('hidden'));
        }
    };

    // Manages all animations on the page
    const AnimationModule = {
        init() {
            this.setupScrollAnimations();
            this.initHeroTitleAnimation();
        },
        // Use IntersectionObserver for efficient scroll-triggered animations
        setupScrollAnimations() {
            if (!('IntersectionObserver' in window)) {
                DOM.animatedElements.forEach(el => el.classList.add('in-view'));
                return;
            }
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => entry.target.classList.add('in-view'), parseInt(entry.target.dataset.animationDelay || 0, 10));
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });
            DOM.animatedElements.forEach(el => observer.observe(el));
        },
        // Creates the staggered letter reveal effect for the main title
        initHeroTitleAnimation() {
            if (!DOM.heroTitle) return;
            const text = "Chesser Academy";
            DOM.heroTitle.innerHTML = text.split('').map((char, i) => `<span style="animation-delay: ${i * 50 + 500}ms">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        }
    };

    // Handles scroll-related functionality
    const ScrollModule = {
        init() {
            // Use requestAnimationFrame to optimize scroll event handling
            window.addEventListener('scroll', () => {
                if (!state.isTicking) {
                    window.requestAnimationFrame(() => {
                        this.handleHeaderVisibility(window.scrollY);
                        state.isTicking = false;
                    });
                    state.isTicking = true;
                }
            }, { passive: true });
        },
        // Adds a class to the header when scrolling down
        handleHeaderVisibility(scrollY) {
            if (!DOM.header) return;
            if (scrollY > config.headerHeight) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }
            state.lastScrollY = scrollY;
        }
    };

    // Handles the contact form submission and modal
    const FormModule = {
        init() {
            if (!DOM.contactForm) return;
            DOM.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.showModal();
                DOM.contactForm.reset();
            });
            DOM.closeModalBtn?.addEventListener('click', () => this.hideModal());
        },
        showModal() { DOM.feedbackModal?.classList.add('show'); },
        hideModal() { DOM.feedbackModal?.classList.remove('show'); }
    };

    // Main function to start all modules
    function initialize() {
        PreloaderModule.init();
        AnimationModule.init();
        ScrollModule.init();
        FormModule.init();
    }
    
    // Defer initialization until the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', initialize);
})();