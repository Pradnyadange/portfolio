/**
 * Portfolio Website JavaScript
 * Handles theme toggle, navigation, filtering, animations, and form functionality
 */

// ========================================
// DOM Elements
// ========================================
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const themeToggle = document.getElementById('theme-toggle');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const skillProgressBars = document.querySelectorAll('.skill-progress');
const contactForm = document.getElementById('contact-form');
const navLinks = document.querySelectorAll('.nav-link');

// ========================================
// Theme Toggle (Dark Mode)
// ========================================
function initTheme() {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Add a subtle animation class
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 500);
}

// Initialize theme on page load
initTheme();

// Theme toggle event listener
themeToggle.addEventListener('click', toggleTheme);

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
});

// ========================================
// Navigation
// ========================================
// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
let lastScrollY = window.scrollY;

function handleNavbarScroll() {
    const currentScrollY = window.scrollY;
    
    // Add scrolled class for shadow
    if (currentScrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', handleNavbarScroll);

// Active nav link on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        
        if (navLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ========================================
// Project Gallery Filtering
// ========================================
function filterProjects(category) {
    projectCards.forEach((card, index) => {
        const cardCategory = card.getAttribute('data-category');
        
        // Add staggered animation delay
        card.style.transitionDelay = `${index * 50}ms`;
        
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.8)';
            setTimeout(() => {
                card.classList.add('hidden');
            }, 300);
        }
    });
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter projects
        const filter = button.getAttribute('data-filter');
        filterProjects(filter);
    });
});

// ========================================
// Skills Progress Bar Animation
// ========================================
function animateSkillBars() {
    skillProgressBars.forEach(bar => {
        const progress = bar.getAttribute('data-progress');
        const rect = bar.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        
        if (isVisible && !bar.classList.contains('animated')) {
            bar.classList.add('animated');
            bar.style.setProperty('--progress', `${progress}%`);
            bar.style.width = `${progress}%`;
        }
    });
}

// Initial check on page load
animateSkillBars();

// Check on scroll
window.addEventListener('scroll', animateSkillBars);

// ========================================
// Modern Skills Section Animation
// ========================================
function animateModernSkillCards() {
    const skillCards = document.querySelectorAll('.skill-card-modern');
    
    skillCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight - 100 && rect.bottom >= 0;
        
        if (isVisible && !card.classList.contains('animated')) {
            // Add staggered animation delay
            setTimeout(() => {
                card.classList.add('animated');
                
                // Get the progress value from data-skill attribute
                const progress = card.getAttribute('data-skill');
                const progressFill = card.querySelector('.progress-fill');
                
                if (progressFill && progress) {
                    progressFill.style.setProperty('--progress', `${progress}%`);
                }
            }, index * 100);
        }
    });
}

// Intersection Observer for modern skills section
const modernSkillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateModernSkillCards();
        }
    });
}, {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
});

// Observe the modern skills section
const skillsSectionModern = document.querySelector('.skills-section-modern');
if (skillsSectionModern) {
    modernSkillsObserver.observe(skillsSectionModern);
}

// Initial check on page load
animateModernSkillCards();

// Check on scroll
window.addEventListener('scroll', animateModernSkillCards);

// ========================================
// Scroll Animations (Intersection Observer)
// ========================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // If it's a skill section, trigger progress bar animation
            if (entry.target.classList.contains('skills-container')) {
                animateSkillBars();
            }
        }
    });
}, observerOptions);

// Observe elements with slide-in class
document.querySelectorAll('.slide-in').forEach(el => {
    observer.observe(el);
});

// Add slide-in class to sections for animation
document.querySelectorAll('.section-header, .about-content, .project-card, .contact-content').forEach(el => {
    el.classList.add('slide-in');
    observer.observe(el);
});

// ========================================
// Smooth Scroll for Navigation Links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navHeight = navbar.offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ========================================
// API Configuration
// ========================================
const API_BASE_URL = (() => {
    // In production, use the same origin
    // In development, you may need to specify the backend URL
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Try common development ports
        return 'http://localhost:3000';
    }
    return window.location.origin;
})();

// ========================================
// Contact Form Handling
// ========================================
async function submitContactForm(formData) {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
        const error = new Error(data.error || 'Failed to send message');
        error.data = data;
        throw error;
    }
    
    return data;
}

function showFormMessage(type, message) {
    // Remove any existing message
    const existingMessage = contactForm.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `form-message form-message-${type}`;
    messageEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${type === 'success' 
                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
            }
        </svg>
        <span>${message}</span>
    `;
    
    // Insert before submit button
    const submitBtn = contactForm.querySelector('.btn-submit');
    submitBtn.parentNode.insertBefore(messageEl, submitBtn);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageEl.classList.add('fade-out');
        setTimeout(() => messageEl.remove(), 300);
    }, 5000);
}

function setFormLoading(isLoading) {
    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalContent = submitBtn.dataset.originalContent || submitBtn.innerHTML;
    
    if (isLoading) {
        submitBtn.dataset.originalContent = originalContent;
        submitBtn.innerHTML = `
            <span>Sending...</span>
            <svg class="spinner animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
        `;
        submitBtn.disabled = true;
        submitBtn.classList.add('btn-loading');
    } else {
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn-loading');
    }
}

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: contactForm.querySelector('#name').value.trim(),
        email: contactForm.querySelector('#email').value.trim(),
        subject: contactForm.querySelector('#subject').value.trim(),
        message: contactForm.querySelector('#message').value.trim(),
    };
    
    // Basic client-side validation
    if (!formData.name || formData.name.length < 2) {
        showFormMessage('error', 'Please enter a valid name (at least 2 characters)');
        return;
    }
    
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        showFormMessage('error', 'Please enter a valid email address');
        return;
    }
    
    if (!formData.message || formData.message.length < 10) {
        showFormMessage('error', 'Please enter a message (at least 10 characters)');
        return;
    }
    
    // Show loading state
    setFormLoading(true);
    
    try {
        // Submit to backend
        const result = await submitContactForm(formData);
        
        // Show success message
        showFormMessage('success', result.message || 'Your message has been sent successfully!');
        
        // Reset form
        contactForm.reset();
        
        // Update button to show success
        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.innerHTML = `
            <span>Message Sent!</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        `;
        submitBtn.style.backgroundColor = '#10b981';
        
        // Reset button after delay
        setTimeout(() => {
            setFormLoading(false);
            submitBtn.style.backgroundColor = '';
        }, 3000);
        
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Handle different error types
        let errorMessage = 'Failed to send message. Please try again later.';
        
        if (error.data) {
            switch (error.data.code) {
                case 'VALIDATION_ERROR':
                    errorMessage = error.data.details?.map(d => d.message).join(', ') || 'Please check your input';
                    break;
                case 'RATE_LIMIT_EXCEEDED':
                    errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
                    break;
                case 'SPAM_DETECTED':
                    errorMessage = 'Your message was flagged as spam. Please revise and try again.';
                    break;
                case 'SERVICE_UNAVAILABLE':
                    errorMessage = 'Email service is temporarily unavailable. Please try again later.';
                    break;
                case 'EMAIL_AUTH_ERROR':
                case 'EMAIL_CONNECTION_ERROR':
                    errorMessage = 'There was a problem connecting to the email service. Please try again later.';
                    break;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showFormMessage('error', errorMessage);
        setFormLoading(false);
    }
});

// ========================================
// Form Input Animations
// ========================================
const formInputs = document.querySelectorAll('.form-input');

formInputs.forEach(input => {
    // Add focus class to parent for styling
    input.addEventListener('focus', () => {
        input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('focused');
        }
    });
});

// ========================================
// Parallax Effect for Hero
// ========================================
function handleParallax() {
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual && window.innerWidth > 1024) {
        const scrolled = window.scrollY;
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
    }
}

window.addEventListener('scroll', handleParallax);

// ========================================
// Typing Effect for Hero Title (Optional Enhancement)
// ========================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// ========================================
// Cursor Trail Effect (Optional Enhancement)
// ========================================
function createCursorTrail() {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    document.body.appendChild(trail);
    
    document.addEventListener('mousemove', (e) => {
        trail.style.left = e.clientX + 'px';
        trail.style.top = e.clientY + 'px';
    });
}

// Uncomment to enable cursor trail
// createCursorTrail();

// ========================================
// Lazy Loading Images (for future use with real images)
// ========================================
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ========================================
// Performance Optimization: Debounce & Throttle
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll events for better performance
const throttledScrollHandler = throttle(() => {
    handleNavbarScroll();
    updateActiveNavLink();
    animateSkillBars();
    handleParallax();
}, 16);

window.removeEventListener('scroll', handleNavbarScroll);
window.removeEventListener('scroll', updateActiveNavLink);
window.removeEventListener('scroll', animateSkillBars);
window.addEventListener('scroll', throttledScrollHandler);

// ========================================
// Initialize on Page Load
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initTheme();
    lazyLoadImages();
    
    // Trigger initial animations
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// ========================================
// Handle Page Visibility Changes
// ========================================
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Re-animate skill bars when page becomes visible
        animateSkillBars();
    }
});

// ========================================
// Error Handling
// ========================================
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.message);
});

// ========================================
// Console Easter Egg
// ========================================
console.log('%c👋 Hello, curious developer!', 'font-size: 20px; font-weight: bold; color: #6366f1;');
console.log('%cThanks for checking out my portfolio. Feel free to reach out!', 'font-size: 14px; color: #4a4a68;');

