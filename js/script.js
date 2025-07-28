document.addEventListener('DOMContentLoaded', () => {

    const stickyRegister = document.getElementById('sticky-register-container');
    const heroSection = document.querySelector('section'); // First section is the hero
    const contactForm = document.getElementById('contact-form');
    const modal = document.getElementById('feedback-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');


    const handleScroll = () => {
        const scrollPosition = window.scrollY;


        if (heroSection && scrollPosition > heroSection.offsetHeight - 200) {
            stickyRegister.classList.add('visible');
        } else {
            stickyRegister.classList.remove('visible');
        }
    };


    window.addEventListener('scroll', handleScroll);


    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();


            modal.classList.remove('opacity-0', 'pointer-events-none');


            console.log('Form submitted successfully.');
            const formData = new FormData(contactForm);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            contactForm.reset();
        });
    }


    const closeModal = () => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    };


    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }


    if (modal) {
        modal.addEventListener('click', (e) => {

            if (e.target === modal) {
                closeModal();
            }
        });
    }

    window.onload = function () {
        const isLoggedIn = localStorage.getItem('isLoggedIn');

        if (isLoggedIn === 'true') {
            const registerButton = document.getElementById('register-button');
            if (registerButton) {
                registerButton.style.display = 'none';
            }
        }
    };
});