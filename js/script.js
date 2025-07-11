document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const stickyRegister = document.getElementById('sticky-register-container');
    const heroSection = document.querySelector('section'); // First section is the hero
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('feedback-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Scroll Animation Logic ---
    // This function handles all animations that trigger on scroll
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        
        // Show the sticky register button only after scrolling past most of the hero section
        if (heroSection && scrollPosition > heroSection.offsetHeight - 200) {
            stickyRegister.classList.add('visible');
        } else {
            stickyRegister.classList.remove('visible');
        }
    };

    // Attach the scroll handler to the window's scroll event
    window.addEventListener('scroll', handleScroll);
    
    // --- Contact Form Logic ---
    // Handles the submission of the contact form
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent the form from doing a default page reload
            
            // Show the feedback modal
            modal.classList.remove('opacity-0', 'pointer-events-none');
            
            // For a real website, you would send form data to a server here.
            // We'll just log it to the console for this demonstration.
            console.log('Form submitted successfully.');
            const formData = new FormData(contactForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            contactForm.reset(); // Clear the form fields after submission
        });
    }

    // --- Modal Closing Logic ---
    // Function to hide the feedback modal
    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    };

    // Add click listeners to close the modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    // Also allow closing the modal by clicking on the dark background overlay
    if (modal) {
        modal.addEventListener('click', (e) => {
            // e.target is the element that was clicked.
            // We only close the modal if the click was on the modal background itself,
            // not on its content.
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});