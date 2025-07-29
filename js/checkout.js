'use strict';
(() => {
    // Cache all DOM elements related to the cart and header
    const DOM = {
        headerActions: document.getElementById('header-actions'),
        cartDrawer: document.getElementById('cart-drawer'),
        cartDrawerOverlay: document.getElementById('cart-drawer-overlay'),
        closeCartBtn: document.getElementById('close-cart-btn'),
        cartBody: document.getElementById('cart-body'),
        cartTotalPrice: document.getElementById('cart-total-price'),
        checkoutBtn: document.getElementById('checkout-btn'),
        orderSummaryItems: document.getElementById('order-summary-items'),
        orderTotalPrice: document.getElementById('order-total-price'),
        paymentForm: document.getElementById('payment-form'),
        cartIcon: null,       // Will be created dynamically
        cartItemCount: null, // Will be created dynamically
    };

    // This array will hold the items in the cart
    let cart = [];

    // Dynamically builds the header actions based on login state
    const renderHeader = () => {
        if (!DOM.headerActions) return;
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const username = sessionStorage.getItem('loggedInUser');

        // Always include the cart icon
        let headerHTML = `
            <div class="cart-icon-wrapper" id="cart-icon">
                <i class="fa-solid fa-shopping-cart"></i>
                <span class="cart-item-count" id="cart-item-count">0</span>
            </div>
        `;

        // Prepend login or logout buttons based on state
        if (isLoggedIn) {
            headerHTML = `
                <span class="welcome-user">Welcome, ${username}</span>
                <button id="logout-btn" class="button-primary nav-btn-logout">Logout</button>
            ` + headerHTML;
        } else {
            headerHTML = `<a href="login.html" class="button-primary nav-btn">Login</a>` + headerHTML;
        }
        DOM.headerActions.innerHTML = headerHTML;

        // Re-cache elements that were just created
        DOM.cartIcon = document.getElementById('cart-icon');
        DOM.cartItemCount = document.getElementById('cart-item-count');

        // Add listeners to the newly created elements
        DOM.cartIcon?.addEventListener('click', toggleCartDrawer);
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            sessionStorage.clear(); // Log out user
            cart = []; // Clear the cart array
            saveCart(); // Update localStorage
            renderHeader(); // Re-render the header to show "Login"
            updateCartInfo(); // Update cart count to 0
            renderCart(); // Re-render the empty cart
        });
    };

    // Toggles the visibility of the cart drawer
    const toggleCartDrawer = () => {
        DOM.cartDrawer?.classList.toggle('visible');
        DOM.cartDrawerOverlay?.classList.toggle('visible');
    };

    // Adds an item to the cart, preventing duplicates
    const addToCart = (id, name, price) => {
        if (cart.find(item => item.id === id)) {
            alert(`${name} is already in your cart.`);
            return;
        }
        cart.push({ id, name, price });
        saveCart();
        renderCart();
    };

    // Removes an item from the cart by its ID
    const removeFromCart = id => {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        renderCart();
    };

    // Renders the cart items in the UI drawer
    const renderCart = () => {
        if (!DOM.cartBody) return;
        DOM.cartBody.innerHTML = cart.length === 0 ? '<p class="cart-empty-message">Your cart is empty.</p>' :
            cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                        <button class="cart-item-remove-btn" data-id="${item.id}">Remove</button>
                    </div>
                </div>`).join('');
        updateCartInfo();
    };

    // Updates the cart's total price and item count badge
    const updateCartInfo = () => {
        const totalItems = cart.length;
        const totalPrice = cart.reduce((total, item) => total + item.price, 0);
        if (DOM.cartItemCount) DOM.cartItemCount.textContent = totalItems;
        if (DOM.cartTotalPrice) DOM.cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
    };

    // Saves the cart to localStorage
    const saveCart = () => localStorage.setItem('chesserCart', JSON.stringify(cart));

    // Loads the cart from localStorage
    const loadCart = () => {
        const storedCart = localStorage.getItem('chesserCart');
        if (storedCart) cart = JSON.parse(storedCart);
    };

    // Populates the dedicated checkout page with items from the cart
    const renderCheckoutPage = () => {
        // Protect the route: if not logged in, redirect to login page
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = `login.html?redirect=checkout.html`;
            return;
        }
        if (!DOM.orderSummaryItems) return; // Exit if not on the checkout page

        // Display items or an empty message
        DOM.orderSummaryItems.innerHTML = cart.length > 0 ?
            cart.map(item => `<div class="summary-item"><span>${item.name}</span><span>$${item.price.toFixed(2)}</span></div>`).join('') :
            '<p>Your cart is empty.</p>';
        
        // Calculate and display the total price
        const totalPrice = cart.reduce((total, item) => total + item.price, 0);
        if (DOM.orderTotalPrice) DOM.orderTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
        
        // Hide the payment form if the cart is empty
        if (cart.length === 0 && DOM.paymentForm) {
            DOM.paymentForm.style.display = 'none';
        }
    };

    // Main function to initialize all cart-related functionality
    const initialize = () => {
        loadCart();
        renderHeader();
        renderCart();
        
        // Listen for clicks on cart controls
        DOM.closeCartBtn?.addEventListener('click', toggleCartDrawer);
        DOM.cartDrawerOverlay?.addEventListener('click', toggleCartDrawer);
        DOM.cartBody?.addEventListener('click', e => {
            if (e.target?.classList.contains('cart-item-remove-btn')) removeFromCart(e.target.dataset.id);
        });

        // Handle the "Proceed to Checkout" button click
        DOM.checkoutBtn?.addEventListener('click', () => {
            if (sessionStorage.getItem('isLoggedIn') === 'true') {
                window.location.href = 'checkout.html';
            } else {
                alert('Please log in to proceed to checkout.');
                window.location.href = 'login.html?redirect=checkout.html';
            }
        });

        // Run specific logic if we are on the checkout page
        if (document.body.classList.contains('checkout-page')) {
            renderCheckoutPage();
            // Handle the final payment submission
            DOM.paymentForm?.addEventListener('submit', e => {
                e.preventDefault();
                if (cart.length === 0) {
                    alert("Your cart is empty!");
                    return;
                }
                alert('Thank you for your purchase! Your training begins now.');
                cart = [];
                saveCart();
                window.location.href = 'index.html';
            });
        }
        
        // Make the addToCart function globally accessible for other scripts
        window.chesserCart = { add: addToCart };
    };

    // Run the initialization function when the DOM is ready
    document.addEventListener('DOMContentLoaded', initialize);
})();