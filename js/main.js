// Global Horizon Academy - JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // Set current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Mobile menu functionality
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenuBtn = document.querySelector('.close-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Mobile login button
    const mobileLoginBtn = document.getElementById('mobile-login-button');
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
            openLoginModal();
        });
    }
    
    // Login modal functionality
    const loginButton = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const closeLogin = document.getElementById('close-login');
    
    function openLoginModal() {
        if (loginModal) {
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeLoginModal() {
        if (loginModal) {
            loginModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
    
    if (loginButton) {
        loginButton.addEventListener('click', openLoginModal);
    }
    
    if (closeLogin) {
        closeLogin.addEventListener('click', closeLoginModal);
    }
    
    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    
    // FAQ accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(function(question) {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i');
            
            // Toggle active class on question
            this.classList.toggle('active');
            
            // Toggle answer visibility
            if (answer.style.display === 'block') {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
    
    // Back to top button functionality
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Form submission handling
    const forms = document.querySelectorAll('form');
    
    forms.forEach(function(form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simple form validation
            let isValid = true;
            const inputs = this.querySelectorAll('input[required], select[required], textarea[required]');
            
            inputs.forEach(function(input) {
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (isValid) {
                // In a real application, you would submit the form data to a server
                // For this demo, we'll just show an alert
                alert('Form submitted successfully! In a real application, this data would be sent to a server.');
                form.reset();
                
                // If it's the login form, close the modal
                if (form.closest('#login-modal')) {
                    closeLoginModal();
                }
            } else {
                alert('Please fill in all required fields.');
            }
        });
    });
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (mobileMenu.classList.contains('active')) {
                    mobileMenu.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
                
                // Calculate offset based on header height
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header scroll effect
    const header = document.getElementById('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 50) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                header.style.padding = '0.5rem 0';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
                header.style.padding = '1rem 0';
            }
        });
    }
    
    // Course card hover effect enhancement
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Program card hover effect enhancement
    const programCards = document.querySelectorAll('.program-card, .track-card, .signature-card');
    
    programCards.forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
            this.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        });
    });
});









/**
 * Global Horizon Academy - Enhanced JavaScript for Menu, Login, and Animations
 * 
 * Features:
 * - Mobile menu toggle with accessibility enhancements
 * - Login modal with keyboard navigation support
 * - Smooth scrolling navigation
 * - AOS animation initialization
 * - Performance optimizations
 * - FAQ accordion functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // ==========================================
    // 1. Mobile Menu Functionality
    // ==========================================
    function initMobileMenu() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const mobileLoginButton = document.getElementById('mobile-login-button');

        if (!mobileMenuButton || !mobileMenu) return;

        const toggleMenu = () => {
            const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true';
            mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
            mobileMenu.setAttribute('aria-hidden', isExpanded.toString());

            // Toggle icon
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }

            // Toggle body scroll
            document.body.style.overflow = isExpanded ? '' : 'hidden';
        };

        // Menu button click handler
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking on links
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!mobileMenu.classList.contains('hidden')) {
                    toggleMenu();
                }
            });
        });

        // Handle mobile login button separately
        if (mobileLoginButton) {
            mobileLoginButton.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMenu(); // Close mobile menu
                openLoginModal(); // Open login modal
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileMenu.contains(e.target) && e.target !== mobileMenuButton && !mobileMenu.classList.contains('hidden')) {
                toggleMenu();
            }
        });

        // Close menu with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
                toggleMenu();
                mobileMenuButton.focus();
            }
        });
    }

    // ==========================================
    // 2. Login Modal Functionality
    // ==========================================
    function initLoginModal() {
        const loginButtons = document.querySelectorAll('#login-button, #mobile-login-button');
        const loginModal = document.getElementById('login-modal');
        const closeLogin = document.getElementById('close-login');

        if (!loginModal) return;

        const modalContent = loginModal.querySelector('div');
        let previouslyFocusedElement = null;

        const openModal = () => {
            previouslyFocusedElement = document.activeElement;
            loginModal.classList.remove('invisible', 'opacity-0');
            loginModal.classList.add('visible', 'opacity-100');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
            loginModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Focus on first interactive element
            const focusableElements = loginModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length) {
                setTimeout(() => focusableElements[0].focus(), 100);
            }
        };

        const closeModal = () => {
            loginModal.classList.remove('visible', 'opacity-100');
            loginModal.classList.add('invisible', 'opacity-0');
            modalContent.classList.remove('scale-100');
            modalContent.classList.add('scale-95');
            loginModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            // Return focus to previously focused element
            if (previouslyFocusedElement) {
                setTimeout(() => previouslyFocusedElement.focus(), 100);
            }
        };

        // Open modal handlers
        loginButtons.forEach(button => {
            if (button.id !== 'mobile-login-button') { // mobile login handled separately
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    openModal();
                });
            }
        });

        // Close modal handlers
        if (closeLogin) {
            closeLogin.addEventListener('click', closeModal);
        }

        // Close when clicking outside modal content
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                closeModal();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && loginModal.classList.contains('visible')) {
                closeModal();
            }

            // Trap focus inside modal when open
            if (loginModal.classList.contains('visible') && e.key === 'Tab') {
                const focusableElements = loginModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Handle form submission
        const loginForm = loginModal.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                // Add your login logic here
                console.log('Login form submitted');
                // closeModal(); // Uncomment to close modal on successful login
            });
        }

        // Expose openModal for external use
        window.openLoginModal = openModal;
    }

    // ==========================================
    // 3. Smooth Scrolling Navigation
    // ==========================================
    function initSmoothScrolling() {
        const header = document.getElementById('header');
        if (!header) return;

        const headerHeight = header.offsetHeight;
        const scrollOffset = headerHeight + 20; // Add small buffer

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Skip if it's a dropdown toggle or has special class
            if (anchor.getAttribute('href') === '#' || 
                anchor.getAttribute('href') === '#!') return;

            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                
                // Check if it's an anchor link
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetElement = document.querySelector(targetId);

                    if (targetElement) {
                        const targetPosition = targetElement.offsetTop - scrollOffset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL without page jump
                        if (history.pushState) {
                            history.pushState(null, null, targetId);
                        } else {
                            location.hash = targetId;
                        }

                        // Close mobile menu if open
                        const mobileMenu = document.getElementById('mobile-menu');
                        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                            document.getElementById('mobile-menu-button').click();
                        }
                    }
                }
            });
        });
    }

    // ==========================================
    // 4. Back to Top Button
    // ==========================================
    function initBackToTop() {
        const backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;

        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.remove('opacity-0', 'invisible');
                backToTopButton.classList.add('opacity-100', 'visible');
            } else {
                backToTopButton.classList.remove('opacity-100', 'visible');
                backToTopButton.classList.add('opacity-0', 'invisible');
            }
        };

        // Use requestAnimationFrame for smoother performance
        let ticking = false;
        const updateVisibility = () => {
            toggleVisibility();
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateVisibility);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
        toggleVisibility(); // Initialize visibility

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            backToTopButton.blur(); // Remove focus after click
        });
    }

    // ==========================================
    // 5. FAQ Accordion Functionality
    // ==========================================
    function initFAQAccordion() {
        const faqItems = document.querySelectorAll('.faq-question');
        
        if (faqItems.length === 0) return;

        faqItems.forEach(question => {
            // Set initial ARIA attributes
            const answer = question.nextElementSibling;
            if (answer && answer.classList.contains('faq-answer')) {
                question.setAttribute('aria-expanded', 'false');
                answer.setAttribute('aria-hidden', 'true');
                
                // Add role and tabindex for accessibility
                question.setAttribute('role', 'button');
                question.setAttribute('tabindex', '0');
            }

            question.addEventListener('click', () => {
                toggleFAQItem(question);
            });

            // Add keyboard support
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFAQItem(question);
                } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const allQuestions = Array.from(faqItems);
                    const currentIndex = allQuestions.indexOf(question);
                    
                    if (e.key === 'ArrowDown' && currentIndex < allQuestions.length - 1) {
                        allQuestions[currentIndex + 1].focus();
                    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
                        allQuestions[currentIndex - 1].focus();
                    }
                }
            });
        });

        function toggleFAQItem(question) {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            if (!answer || !answer.classList.contains('faq-answer')) return;

            // Toggle answer visibility
            answer.classList.toggle('hidden');
            
            // Toggle icon rotation
            if (icon) {
                icon.classList.toggle('transform');
                icon.classList.toggle('rotate-180');
            }

            // Toggle ARIA attributes
            const isExpanded = question.getAttribute('aria-expanded') === 'true';
            question.setAttribute('aria-expanded', !isExpanded);
            answer.setAttribute('aria-hidden', isExpanded.toString());
        }
    }

    // ==========================================
    // 6. Initialize AOS Animations
    // ==========================================
    function initAnimations() {
        // Check if AOS is available
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true,
                offset: 100,
                disable: function() {
                    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                }
            });
        } else {
            // Fallback for when AOS is not loaded
            const animatedElements = document.querySelectorAll('[data-aos]');
            animatedElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
        }
    }

    // ==========================================
    // 7. Performance Optimization
    // ==========================================
    function initPerformance() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Add loaded class to images when they load
        document.querySelectorAll('img').forEach(img => {
            if (img.complete) {
                img.classList.add('loaded');
            } else {
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
            }
        });
    }

    // ==========================================
    // 8. Initialize All Components
    // ==========================================
    function init() {
        initMobileMenu();
        initLoginModal();
        initSmoothScrolling();
        initBackToTop();
        initFAQAccordion();
        initAnimations();
        initPerformance();

        // Set current year in footer
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        // Add loaded class to body when everything is ready
        setTimeout(() => {
            document.body.classList.add('loaded');
        }, 100);
    }

    // Start the application
    init();

    // Make functions available globally for debugging
    window.debugGlobalHorizon = {
        initMobileMenu,
        initLoginModal,
        initSmoothScrolling,
        initBackToTop,
        initFAQAccordion,
        initAnimations
    };
});
