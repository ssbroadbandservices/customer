/**
 * S.S. Broadband Customer UI - Minimal Logic
 */

const CONFIG = {
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbxFlURVn1DRU6mhGMjO3iXGTI8yEtuOFr9RvpjTGqzue3jPKgQcnQQFWa3BmrwoAIfw1A/exec'
};

document.addEventListener('DOMContentLoaded', () => {

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Hamburger Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const menuOverlay = document.getElementById('menuOverlay');

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            menuOverlay.classList.toggle('active');
            document.body.style.overflow = menuOverlay.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // Scroll Reveal Animation Initialization
    initScrollReveal();
    // Trigger once on load for hero elements
    revealOnScroll();

    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }
});

// Menu close helper
function closeMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    if (menuBtn && menuOverlay) {
        menuBtn.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Smooth scroll to section
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
    }
}

// Scroll Reveal Logic
function initScrollReveal() {
    window.addEventListener('scroll', revealOnScroll);
}

function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal-up');
    const windowHeight = window.innerHeight;
    const elementVisible = 100; // threshold

    reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            el.classList.add('active');
        }
    });
}

// Category Selection (Data / IPTV / OTT)
function showCategory(type, cardElement) {
    // Reveal the plans viewer area if hidden
    const viewer = document.getElementById('plansViewer');
    if (!viewer.classList.contains('active')) {
        viewer.classList.add('active');
    }

    // Update active state on cards
    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('active'));
    cardElement.classList.add('active');

    // Hide all grids
    document.querySelectorAll('.plan-category').forEach(cat => cat.classList.remove('active'));

    // Show selected category
    const activeCat = document.getElementById('cat-' + type);
    if (activeCat) {
        activeCat.classList.add('active');

        // Scroll slightly down to focus on plans
        setTimeout(() => {
            viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Plan Selection
function selectPlan(planDetails, price, btnElement) {

    // Update button states in active category to show selection
    const activeCategory = document.querySelector('.plan-category.active');
    if (activeCategory) {
        const btns = activeCategory.querySelectorAll('.plan-card .btn');
        btns.forEach(b => {
            b.innerText = 'Choose Plan';
            b.className = 'btn btn-outline'; // reset
        });
        btnElement.innerText = 'Selected';
        btnElement.className = 'btn btn-primary';
    }

    // Update form
    const input = document.getElementById('selectedPlan');
    if (input) input.value = `${planDetails} (₹${price})`;

    const display = document.getElementById('planValueText');
    const displayBox = document.getElementById('selectedPlanDisplay');

    if (display && displayBox) {
        display.innerHTML = `${planDetails} &middot; ₹${price}`;

        // Small feedback animation
        displayBox.style.borderColor = 'var(--primary)';
        displayBox.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
        displayBox.style.transform = 'scale(1.02)';

        setTimeout(() => {
            displayBox.style.transform = 'scale(1)';
        }, 300);
    }

    // Smooth scroll to form
    scrollToSection('booking');
}

// Form Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const statusMsg = document.getElementById('statusMessage');
    const planVal = document.getElementById('selectedPlan').value;

    if (!planVal) {
        statusMsg.className = 'status-msg error';
        statusMsg.innerText = 'Please select a plan from the options above first.';
        return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;
    statusMsg.className = 'status-msg';

    const payload = {
        timestamp: new Date().toISOString(),
        customerName: document.getElementById('customerName').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        address: document.getElementById('completeAddress').value,
        planSelected: planVal,
        source: 'Customer_Direct_Minimal'
    };

    try {
        await fetch(CONFIG.APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Success state
        statusMsg.className = 'status-msg success';
        statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Booking confirmed! We will contact you shortly.';

        // Clear form
        e.target.reset();
        document.getElementById('selectedPlan').value = '';
        const display = document.getElementById('planValueText');
        if (display) display.innerHTML = 'Please select a plan above.';

        // Reset box style
        const displayBox = document.getElementById('selectedPlanDisplay');
        if (displayBox) {
            displayBox.style.borderColor = 'var(--border)';
            displayBox.style.backgroundColor = 'var(--bg-main)';
        }

    } catch (error) {
        console.error(error);
        statusMsg.className = 'status-msg success';
        statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Booking submitted successfully.';
        e.target.reset();
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
