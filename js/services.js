'use strict';
(() => {
    // Cache the grid containing all service cards
    const serviceGrid = document.querySelector('.service-grid');
    if (!serviceGrid) return; // Exit if the grid isn't on this page

    // Use event delegation to listen for clicks on any "Add to Cart" button
    serviceGrid.addEventListener('click', e => {
        const button = e.target.closest('.service-btn');
        if (!button) return; // Exit if the click wasn't on a button

        // Find the parent card to get the service details
        const card = button.closest('.interactive-card');
        const name = card.querySelector('.service-title').textContent;
        const priceText = card.querySelector('.service-price').textContent;
        const price = parseFloat(priceText.replace('$', ''));
        // Create a simple, unique ID from the service name
        const id = name.replace(/\s+/g, '-').toLowerCase();

        // Call the globally exposed 'add' function from checkout.js
        if (window.chesserCart) {
            window.chesserCart.add(id, name, price);
        } else {
            console.error('Cart system (checkout.js) is not initialized.');
        }

        // Provide visual feedback to the user
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.disabled = true;
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    });
})();