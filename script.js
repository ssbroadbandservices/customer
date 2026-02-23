/**
 * S.S. Broadband Customer UI - Logic with Bot Integration + Complaint System
 */

// User's specifically requested IDs and APIs
const TELEGRAM_BOT_TOKEN = '8702024970:AAEfmSkqdAy9SLZGJJfDtxTb-AyWjAshHCs';
const TELEGRAM_CHAT_ID = '6582960717';

// NOTE: To save to Google Sheets directly from JS, you must deploy an Apps Script as a web app.
// Since we only have the view link, we rely on Telegram as the primary immediate DB.
// If the user deploys the Apps Script (provided in separate code snippet), replace this URL with the Web App URL.
let GOOGLE_APPS_SCRIPT_URL = '';

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
    revealOnScroll();

    // Form submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }

    // NEW: Complaint Form submission
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('complaintModal');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeComplaintForm();
        }
    });
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
    const viewer = document.getElementById('plansViewer');
    if (!viewer.classList.contains('active')) {
        viewer.classList.add('active');
    }

    document.querySelectorAll('.service-card').forEach(card => card.classList.remove('active'));
    cardElement.classList.add('active');

    document.querySelectorAll('.plan-category').forEach(cat => cat.classList.remove('active'));

    const activeCat = document.getElementById('cat-' + type);
    if (activeCat) {
        activeCat.classList.add('active');
        setTimeout(() => {
            viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
}

// Plan Selection
function selectPlan(planDetails, price, btnElement) {
    const activeCategory = document.querySelector('.plan-category.active');
    if (activeCategory) {
        const btns = activeCategory.querySelectorAll('.plan-card .btn');
        btns.forEach(b => {
            b.innerText = 'Choose Plan';
            b.className = 'btn btn-outline'; // reset
            if (b.parentElement.classList.contains('popular')) b.className = 'btn btn-primary';
        });
        btnElement.innerText = 'Selected';
        btnElement.className = 'btn btn-primary';
    }

    const input = document.getElementById('selectedPlan');
    if (input) input.value = `${planDetails} (₹${price}/-)`;

    const display = document.getElementById('planValueText');
    const displayBox = document.getElementById('selectedPlanDisplay');

    if (display && displayBox) {
        display.innerHTML = `${planDetails} &middot; ₹${price}/-`;

        displayBox.style.borderColor = 'var(--primary)';
        displayBox.style.backgroundColor = 'rgba(67, 97, 238, 0.05)';
        displayBox.style.transform = 'scale(1.02)';

        setTimeout(() => {
            displayBox.style.transform = 'scale(1)';
        }, 300);
    }

    scrollToSection('booking');
}

// NEW: Open Complaint Form
function openComplaintForm() {
    const modal = document.getElementById('complaintModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

// NEW: Close Complaint Form
function closeComplaintForm() {
    const modal = document.getElementById('complaintModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// NEW: Handle Complaint Submission
async function handleComplaintSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('complaintSubmitBtn');
    const statusMsg = document.getElementById('complaintStatusMessage');
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;
    statusMsg.className = 'status-msg';

    const customerName = document.getElementById('complaintName').value;
    const phoneNumber = document.getElementById('complaintPhone').value;
    const address = document.getElementById('complaintAddress').value;
    const complaintType = document.getElementById('complaintType').value;
    const description = document.getElementById('complaintDescription').value;
    const date = new Date().toLocaleString();

    // Format complaint type display
    let complaintTypeDisplay = complaintType || 'Not specified';
    
    // Prepare Telegram Message - Different format for complaints
    const telegramMessage = `
⚠️ **NEW COMPLAINT REGISTRATION** ⚠️

👤 **Name:** ${customerName}
📞 **Phone:** ${phoneNumber}
📍 **Address:** ${address}
🔧 **Issue Type:** ${complaintTypeDisplay}
📝 **Description:** ${description || 'No description provided'}
⏱️ **Time:** ${date}
    `;

    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        // Post to Telegram
        const response = await fetch(telegramURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        if (!response.ok) {
            throw new Error('Telegram API error');
        }

        // Success state
        statusMsg.className = 'status-msg success';
        statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Complaint registered! We will contact you shortly.';

        // Clear form
        e.target.reset();

        // Close modal after 2 seconds
        setTimeout(() => {
            closeComplaintForm();
        }, 2000);

    } catch (error) {
        console.error(error);
        statusMsg.className = 'status-msg error';
        statusMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network error. Please try calling us at 8959334650 instead.';
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Booking Form Submit Handler (Existing)
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

    const customerName = document.getElementById('customerName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('completeAddress').value;
    const date = new Date().toLocaleString();

    // 1. Send specific message to Telegram Bot
    const telegramMessage = `
🚨 **NEW BROADBAND BOOKING** 🚨

👤 **Name:** ${customerName}
📞 **Phone:** ${phoneNumber}
📍 **Address:** ${address}
📦 **Plan:** ${planVal}
⏱️ **Time:** ${date}
    `;

    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        // Post to Telegram
        await fetch(telegramURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown'
            })
        });

        // 2. Optional: Post to Google Sheets if App Script URL is active
        if (GOOGLE_APPS_SCRIPT_URL) {
            await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    timestamp: date,
                    customerName: customerName,
                    phoneNumber: phoneNumber,
                    address: address,
                    planSelected: planVal,
                    source: 'Customer_Direct_Website'
                })
            });
        }

        // Success state
        statusMsg.className = 'status-msg success';
        statusMsg.innerHTML = '<i class="fas fa-check-circle"></i> Booking confirmed! We will contact you shortly.';

        // Clear form
        e.target.reset();
        document.getElementById('selectedPlan').value = '';
        const display = document.getElementById('planValueText');
        if (display) display.innerHTML = 'Please select a plan above.';

        const displayBox = document.getElementById('selectedPlanDisplay');
        if (displayBox) {
            displayBox.style.borderColor = 'var(--border)';
            displayBox.style.backgroundColor = 'var(--bg-main)';
        }

    } catch (error) {
        console.error(error);
        statusMsg.className = 'status-msg error';
        statusMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Network error. Please try calling us at 8959334650 instead.';
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}
