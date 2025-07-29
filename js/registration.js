'use strict';
(() => {
    // Cache form elements from the DOM
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;

    const usernameField = document.getElementById('username');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    const feedbackModal = document.getElementById('feedback-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Shows an error message for a specific field
    const showError = (field, message) => {
        const formGroup = field.closest('.form-group');
        const errorContainer = formGroup.querySelector('.error-message');
        if (errorContainer) errorContainer.textContent = message;
    };

    // Clears the error message for a field
    const clearError = (field) => {
        const formGroup = field.closest('.form-group');
        const errorContainer = formGroup.querySelector('.error-message');
        if (errorContainer) errorContainer.textContent = '';
    };

    // Validates the entire form and displays errors
    const validateForm = () => {
        let isValid = true;
        // Clear all previous errors before re-validating
        [usernameField, emailField, passwordField, confirmPasswordField].forEach(clearError);

        // Username validation
        if (usernameField.value.trim().length < 3) {
            showError(usernameField, 'Username must be at least 3 characters.');
            isValid = false;
        }
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
            showError(emailField, 'Please enter a valid email address.');
            isValid = false;
        }
        // Password validation
        if (passwordField.value.length < 8) {
            showError(passwordField, 'Password must be at least 8 characters.');
            isValid = false;
        }
        // Confirm password validation
        if (passwordField.value !== confirmPasswordField.value) {
            showError(confirmPasswordField, 'Passwords do not match.');
            isValid = false;
        }
        return isValid;
    };

    // Add listener for the form submission
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // If the form is valid, proceed with registration
        if (validateForm()) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            users.push({
                username: usernameField.value,
                email: emailField.value,
                password: passwordField.value // Storing plain text is insecure; for demo purposes only
            });
            localStorage.setItem('users', JSON.stringify(users));

            // *** FIX: Set a flag indicating a new user just registered ***
            sessionStorage.setItem('justRegistered', 'true');

            // Show success modal
            feedbackModal?.classList.add('show');
        }
    });

    // Add listener to the modal's close button to proceed to login
    closeModalBtn?.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
})();