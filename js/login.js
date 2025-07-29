'use strict';
(() => {
    // Cache form elements from the DOM
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const formError = document.getElementById('form-error');

    // Add listener for the form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (formError) formError.textContent = ''; // Clear previous errors

        const email = emailField.value;
        const password = passwordField.value;

        // Basic validation
        if (!email || !password) {
            if (formError) formError.textContent = 'Please enter both email and password.';
            return;
        }

        // Retrieve users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);

        // Check if user was found
        if (user) {
            // Set login status in the session
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loggedInUser', user.username);
            
            // *** FIX: Check if the user just registered ***
            const justRegistered = sessionStorage.getItem('justRegistered') === 'true';
            
            if (justRegistered) {
                // If they just registered, clear the flag and send them to the services page
                sessionStorage.removeItem('justRegistered');
                window.location.href = 'services.html';
            } else {
                // For returning users, check for a redirect URL (e.g., from trying to access checkout)
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect');
                // Redirect to the intended page, or default to the homepage
                window.location.href = redirectUrl || 'index.html';
            }
        } else {
            // If user is not found, show an error
            if (formError) formError.textContent = 'Invalid email or password. Please try again.';
            passwordField.value = '';
        }
    });
})();