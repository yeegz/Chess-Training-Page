'use strict';
(() => {
    // Cache all DOM elements related to the cart and header
    const DOM = {}; // Initialize as empty object

    // Helper function to safely get elements
    const getElement = (id, name) => {
        const element = document.getElementById(id);
        return element;
    };

    // This array will hold the items in the cart
    let cart = [];

    // Dynamically builds the header actions based on login state
    const renderHeader = () => {
        DOM.headerActions = getElement('header-actions', 'Header Actions');
        if (!DOM.headerActions) {
            console.warn('Header actions container not found. Skipping header rendering.');
            return;
        }

        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const username = sessionStorage.getItem('loggedInUser');

        let headerHTML = `
            <div class="cart-icon-wrapper" id="cart-icon">
                <i class="fa-solid fa-shopping-cart"></i>
                <span class="cart-item-count" id="cart-item-count">0</span>
            </div>
        `;

        if (isLoggedIn) {
            headerHTML = `
                <span class="welcome-user">Welcome, ${username}</span>
                <button id="logout-btn" class="button-primary nav-btn-logout">Logout</button>
            ` + headerHTML;
        } else {
            headerHTML = `<a href="login.html" class="button-primary nav-btn">Login</a>` + headerHTML;
        }
        DOM.headerActions.innerHTML = headerHTML;

        // Re-cache elements that were just created in the header
        DOM.cartIcon = getElement('cart-icon', 'Cart Icon');
        DOM.cartItemCount = getElement('cart-item-count', 'Cart Item Count');

        // Add listeners to the newly created elements
        if (DOM.cartIcon) {
            DOM.cartIcon.addEventListener('click', toggleCartDrawer);
        } else {
            console.warn("cartIcon not found for event listener attachment after rendering header.");
        }
        const logoutBtn = getElement('logout-btn', 'Logout Button');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                sessionStorage.clear(); // Log out user
                cart = []; // Clear the cart array
                saveCart(); // Update localStorage
                renderHeader(); // Re-render the header to show "Login"
                updateCartInfo(); // Update cart count to 0
                renderCart(); // Re-render the empty cart
                console.log('User logged out. Cart cleared.');
            });
        }
        console.log('Header rendered. Login status:', isLoggedIn ? 'Logged In' : 'Logged Out');
    };

    // Toggles the visibility of the cart drawer
    const toggleCartDrawer = () => {
        console.log('toggleCartDrawer function called.');
        if (DOM.cartDrawer) DOM.cartDrawer.classList.toggle('visible');
        if (DOM.cartDrawerOverlay) DOM.cartDrawerOverlay.classList.toggle('visible');
        console.log('Cart drawer toggled. Visibility status:', DOM.cartDrawer?.classList.contains('visible'));
    };

    // Adds an item to the cart, preventing duplicates and storing session details
    const addToCart = (id, name, price, type, sessionsPerWeek, sessions) => {
        console.log('--- addToCart function called in checkout.js ---');
        console.log('Received data:', { id, name, price, type, sessionsPerWeek, sessions });

        // Create a more unique ID including session details to allow adding the same service with different sessions
        // Ensure sessions are sorted consistently for uniqueId generation
        const sortedSessions = [...sessions].sort((a, b) => a.day.localeCompare(b.day) || a.time.localeCompare(b.time));
        const uniqueId = `${id}-${JSON.stringify(sortedSessions)}`;

        if (cart.find(item => item.uniqueId === uniqueId)) {
            console.log('Item with this unique ID already exists in cart:', uniqueId);
            showCustomAlert(`${name} with these sessions is already in your cart.`);
            return;
        }

        cart.push({ uniqueId, id, name, price, type, sessionsPerWeek, sessions });
        console.log('Item pushed to cart array. Current cart state:', cart);
        saveCart();
        renderCart();
        showCustomAlert(`${name} added to cart!`);
        toggleCartDrawer();
        console.log('--- addToCart function finished ---');
    };

    // Removes an item from the cart by its ID
    const removeFromCart = uniqueId => {
        cart = cart.filter(item => item.uniqueId !== uniqueId);
        saveCart();
        renderCart();
        // If on checkout page, re-render the summary to reflect changes
        if (document.body.classList.contains('checkout-page')) {
            renderCheckoutPage();
        }
        console.log('Item removed from cart. Current cart state:', cart);
    };

    // Renders the cart items in the UI drawer
    const renderCart = () => {
        if (!DOM.cartBody) {
            console.warn('Cart body element not found. Cannot render cart.');
            return;
        }

        console.log('Rendering cart. Current cart array:', cart);
        DOM.cartBody.innerHTML = cart.length === 0 ? '<p class="cart-empty-message">Your cart is empty.</p>' :
            cart.map(item => {
                const sessionDetails = Array.isArray(item.sessions) ? 
                                     item.sessions.map(s => `${s.day} (${s.time})`).join(', ') : 
                                     'No sessions selected';
                return `
                    <div class="cart-item">
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.name}</h4>
                            <p class="cart-item-sessions">${item.sessionsPerWeek} session(s) per week: ${sessionDetails}</p>
                            <p class="cart-item-price">${item.price.toFixed(2)}RM</p>
                            <button class="cart-item-remove-btn" data-id="${item.uniqueId}">Remove</button>
                        </div>
                    </div>`;
            }).join('');
        
        updateCartInfo();
        console.log('Cart rendered to DOM.');
    };

    // Updates the cart's total price and item count badge
    const updateCartInfo = () => {
        if (!DOM.cartItemCount || !DOM.cartTotalPrice) {
            console.warn('Cart item count or total price element not found. Cannot update cart info.');
            return;
        }

        const totalItems = cart.length;
        const totalPrice = cart.reduce((total, item) => total + item.price, 0);
        DOM.cartItemCount.textContent = totalItems;
        DOM.cartTotalPrice.textContent = `${totalPrice.toFixed(2)}RM`;
        console.log(`Cart info updated: ${totalItems} items, Total: ${totalPrice.toFixed(2)}RM`);
    };

    // Saves the cart to localStorage
    const saveCart = () => {
        try {
            localStorage.setItem('chesserCart', JSON.stringify(cart));
            console.log('Cart saved to localStorage. Content:', JSON.parse(localStorage.getItem('chesserCart')));
        } catch (e) {
            console.error('Error saving cart to localStorage:', e);
            showCustomAlert('Error saving cart. Please check your browser settings.');
        }
    };

    // Loads the cart from localStorage
    const loadCart = () => {
        try {
            const storedCart = localStorage.getItem('chesserCart');
            if (storedCart) {
                cart = JSON.parse(storedCart);
                console.log('Cart loaded from localStorage:', cart);
            } else {
                console.log('No cart found in localStorage.');
            }
        } catch (e) {
            console.error('Error loading cart from localStorage. Resetting cart.', e);
            cart = []; // Reset cart if parsing fails
            showCustomAlert('Error loading saved cart. Your cart has been reset.');
        }
    };

    // Populates the dedicated checkout page with items from the cart
    const renderCheckoutPage = () => {
        if (sessionStorage.getItem('isLoggedIn') !== 'true') {
            window.location.href = `login.html?redirect=checkout.html`;
            return;
        }
        
        if (!document.body.classList.contains('checkout-page')) {
            return;
        }

        if (!DOM.orderSummaryItems || !DOM.orderTotalPrice || !DOM.paymentForm) {
            console.warn('Checkout page elements not fully found. Cannot render checkout page summary.');
            return; 
        }

        console.log('Rendering checkout page. Current cart:', cart);
        DOM.orderSummaryItems.innerHTML = cart.length > 0 ?
            cart.map(item => {
                const sessionDetails = Array.isArray(item.sessions) ? 
                                     item.sessions.map(s => `${s.day} (${s.time})`).join(', ') : 
                                     'No sessions selected';
                return `
                    <div class="summary-item">
                        <span>${item.name}</span>
                        <span>${item.price.toFixed(2)}RM</span>
                        <p class="summary-item-sessions">${item.sessionsPerWeek} session(s): ${sessionDetails}</p>
                    </div>`;
            }).join('') :
            '<p>Your cart is empty.</p>';
        
        const totalPrice = cart.reduce((total, item) => total + item.price, 0);
        DOM.orderTotalPrice.textContent = `${totalPrice.toFixed(2)}RM`;
        
        if (cart.length === 0) {
            DOM.paymentForm.style.display = 'none';
        } else {
            DOM.paymentForm.style.display = 'block';
        }
        console.log('Checkout page rendered.');
    };

    // Custom Alert/Message Box Function
    const showCustomAlert = (message) => {
        if (document.querySelector('.feedback-modal.show')) {
            console.log('An alert is already visible. Not showing new alert:', message);
            return;
        }

        const alertModal = document.createElement('div');
        alertModal.classList.add('feedback-modal');
        alertModal.innerHTML = `
            <div class="modal-content">
                <h3 class="modal-title font-cinzel">Notification</h3>
                <p>${message}</p>
                <button class="button-primary modal-btn">OK</button>
            </div>
        `;
        document.body.appendChild(alertModal);
        requestAnimationFrame(() => alertModal.classList.add('show'));

        alertModal.querySelector('.modal-btn').addEventListener('click', () => {
            alertModal.classList.remove('show');
            alertModal.addEventListener('transitionend', () => alertModal.remove(), { once: true });
        });

        alertModal.addEventListener('click', (e) => {
            if (e.target === alertModal) {
                alertModal.classList.remove('show');
                alertModal.addEventListener('transitionend', () => alertModal.remove(), { once: true });
            }
        });
        console.log('Custom alert shown:', message);
    };

    // Main function to initialize all cart-related functionality
    const initialize = () => {
        DOM.cartDrawer = getElement('cart-drawer', 'Cart Drawer');
        DOM.cartDrawerOverlay = getElement('cart-drawer-overlay', 'Cart Drawer Overlay');
        DOM.newCloseCartBtn = getElement('new-close-cart-btn', 'New Close Cart Button');

        DOM.cartBody = getElement('cart-body', 'Cart Body'); 
        DOM.cartTotalPrice = getElement('cart-total-price', 'Cart Total Price'); 
        DOM.checkoutBtn = getElement('checkout-btn', 'Checkout Button'); 

        if (document.body.classList.contains('checkout-page')) {
            DOM.orderSummaryItems = getElement('order-summary-items', 'Order Summary Items'); 
            DOM.orderTotalPrice = getElement('order-total-price', 'Order Total Price'); 
            DOM.paymentForm = getElement('payment-form', 'Payment Form'); 
        }

        loadCart();
        renderHeader();
        renderCart();
        
        if (DOM.newCloseCartBtn) {
            console.log("Attempting to attach click listener to #new-close-cart-btn:", DOM.newCloseCartBtn);
            DOM.newCloseCartBtn.addEventListener('click', (event) => {
                console.log("newCloseCartBtn clicked!");
                event.stopPropagation(); 
                toggleCartDrawer();
            });
            console.log("Event listener attached to newCloseCartBtn.");
        } else {
            console.warn("newCloseCartBtn not found. Cart close by new button may not work.");
        }

        if (DOM.cartDrawerOverlay) {
            console.log("Attempting to attach click listener to #cart-drawer-overlay:", DOM.cartDrawerOverlay);
            DOM.cartDrawerOverlay.addEventListener('click', (event) => {
                console.log("cartDrawerOverlay clicked!");
                toggleCartDrawer();
            });
            console.log("Event listener attached to cartDrawerOverlay.");
        } else {
            console.warn("cartDrawerOverlay not found. Cart overlay close may not work.");
        }

        if (DOM.cartBody) {
            DOM.cartBody.addEventListener('click', e => {
                const removeButton = e.target.closest('.cart-item-remove-btn');
                if (removeButton) {
                    removeFromCart(removeButton.dataset.id);
                }
            });
        } else {
            console.warn("cartBody not found for remove item listener.");
        }

        if (DOM.checkoutBtn) {
            DOM.checkoutBtn.addEventListener('click', () => {
                if (sessionStorage.getItem('isLoggedIn') === 'true') {
                    if (cart.length === 0) {
                        showCustomAlert('Your cart is empty. Please add items before proceeding to checkout.');
                        return;
                    }
                    window.location.href = 'checkout.html';
                } else {
                    showCustomAlert('Please log in to proceed to checkout.');
                    window.location.href = 'login.html?redirect=checkout.html';
                }
            });
        } else {
            console.warn("checkoutBtn not found for event listener.");
        }

        if (document.body.classList.contains('checkout-page')) {
            renderCheckoutPage();
            if (DOM.paymentForm) {
                DOM.paymentForm.addEventListener('submit', e => {
                    e.preventDefault();
                    if (cart.length === 0) {
                        showCustomAlert("Your cart is empty!");
                        return;
                    }
                    showCustomAlert('Thank you for your purchase! Your training begins now.');
                    cart = [];
                    saveCart();
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                });
            } else {
                console.warn("paymentForm not found for event listener on checkout page.");
            }
        }
        
        // --- START NAVIGATION BAR SCROLL EFFECT ---
        const header = document.getElementById('main-header');
        if (header) { // Ensure the header element exists
            const applyScrollEffect = () => {
                if (window.scrollY > 50) { // Adjust 50px as needed for when the effect kicks in
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
            };

            // Apply immediately on load in case the page is already scrolled down
            applyScrollEffect();
            // Add event listener for scroll
            window.addEventListener('scroll', applyScrollEffect);
            console.log('Scroll effect listener attached to main-header.');
        } else {
            console.warn('Main header element not found for scroll effect.');
        }
        // --- END NAVIGATION BAR SCROLL EFFECT ---

        window.chesserCart = { add: addToCart };
        console.log('checkout.js initialized. window.chesserCart.add is now available.');
    };

    document.addEventListener('DOMContentLoaded', initialize);
})();