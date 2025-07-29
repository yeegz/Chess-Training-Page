'use strict';
(() => {
    // Cache the grid containing all service cards
    const serviceGrid = document.querySelector('.service-grid');
    if (!serviceGrid) return; // Exit if the grid isn't on this page

    // Cache elements for the new session modal
    const sessionModal = document.getElementById('session-modal');
    const sessionModalOverlay = document.getElementById('session-modal-overlay');
    const closeSessionModalBtn = document.getElementById('close-session-modal-btn');
    const sessionModalTitle = document.getElementById('session-modal-title');
    const sessionsNeededText = document.getElementById('sessions-needed-text');
    const dayOptionsContainer = document.getElementById('day-options');
    const timeSelectionContainer = document.getElementById('time-selection-container');
    const sessionSelectionForm = document.getElementById('session-selection-form');
    const dayErrorMessage = document.getElementById('day-error-message');
    const timeErrorMessage = document.getElementById('time-error-message');

    // State for the currently selected service and chosen sessions
    let currentService = null;
    let selectedDays = [];
    let selectedTimes = {}; // Stores times per day: { 'Sunday': '10am-12pm', 'Tuesday': '2pm-4pm' }

    const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
    const GROUP_TIMES = ['10am-12pm', '2pm-4pm'];
    const PRIVATE_TIMES = ['12pm-2pm', '4pm-6pm', '6pm-8pm'];

    // Function to open the session modal
    const openSessionModal = (serviceName, servicePrice, serviceType, sessionsPerWeek) => {
        currentService = {
            name: serviceName,
            price: servicePrice,
            type: serviceType, // 'Group' or 'Private'
            sessionsPerWeek: sessionsPerWeek // 1 or 2
        };
        selectedDays = [];
        selectedTimes = {};
        clearModalErrors();

        sessionModalTitle.textContent = `Select Sessions for ${serviceName}`;
        sessionsNeededText.textContent = `${sessionsPerWeek}`;

        renderDayOptions();
        renderTimeOptions(); // Render initial time options (will be empty until days are selected)

        sessionModal?.classList.add('visible');
        sessionModalOverlay?.classList.add('visible');
        console.log('Session modal opened for:', currentService);
    };

    // Function to close the session modal
    const closeSessionModal = () => {
        sessionModal?.classList.remove('visible');
        sessionModalOverlay?.classList.remove('visible');
        currentService = null; // Clear current service
        console.log('Session modal closed.');
    };

    // Render day options (checkboxes)
    const renderDayOptions = () => {
        dayOptionsContainer.innerHTML = DAYS_OF_WEEK.map(day => `
            <label class="day-option">
                <input type="checkbox" name="day" value="${day}" ${selectedDays.includes(day) ? 'checked' : ''}>
                <span>${day}</span>
            </label>
        `).join('');

        // Add event listener for day selection changes
        dayOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', handleDaySelection);
        });
        console.log('Day options rendered.');
    };

    // Handle day selection (limit based on sessionsPerWeek)
    const handleDaySelection = (event) => {
        const checkbox = event.target;
        const day = checkbox.value;

        if (checkbox.checked) {
            if (selectedDays.length < currentService.sessionsPerWeek) {
                selectedDays.push(day);
                // Initialize time selection for this new day if it's a 2-session pack
                if (currentService.sessionsPerWeek === 2 && !selectedTimes[day]) {
                    selectedTimes[day] = ''; // Placeholder for time selection
                }
            } else {
                checkbox.checked = false; // Prevent selecting more than allowed
                showModalError(dayErrorMessage, `Please select only ${currentService.sessionsPerWeek} day(s).`);
                return;
            }
        } else {
            selectedDays = selectedDays.filter(d => d !== day);
            delete selectedTimes[day]; // Remove time selection if day is deselected
        }
        clearModalError(dayErrorMessage);
        renderTimeOptions(); // Re-render time options based on selected days
        console.log('Selected days:', selectedDays, 'Selected times:', selectedTimes);
    };

    // Render time options dynamically based on selected days and service type
    const renderTimeOptions = () => {
        timeSelectionContainer.innerHTML = ''; // Clear previous times

        if (selectedDays.length === 0) {
            timeSelectionContainer.innerHTML = '<p class="form-label" style="text-align:center;">Please select day(s) first.</p>';
            return;
        }

        const availableTimes = currentService.type === 'Group' ? GROUP_TIMES : PRIVATE_TIMES;

        selectedDays.forEach(day => {
            const timeOptionsHtml = availableTimes.map(time => `
                <label class="time-option">
                    <input type="radio" name="time-${day}" value="${time}" ${selectedTimes[day] === time ? 'checked' : ''}>
                    <span>${time}</span>
                </label>
            `).join('');

            timeSelectionContainer.innerHTML += `
                <div class="time-selection-group">
                    <h4>Time for ${day}</h4>
                    <div class="time-options">
                        ${timeOptionsHtml}
                    </div>
                </div>
            `;
        });

        // Add event listeners for time selection changes
        timeSelectionContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                const day = event.target.name.replace('time-', '');
                selectedTimes[day] = event.target.value;
                clearModalError(timeErrorMessage); // Clear error on selection
                console.log('Time selected for ' + day + ':', selectedTimes[day]);
            });
        });
        console.log('Time options rendered for days:', selectedDays);
    };

    // Validate selections before adding to cart
    const validateSessionSelection = () => {
        let isValid = true;
        clearModalErrors();

        if (selectedDays.length !== currentService.sessionsPerWeek) {
            showModalError(dayErrorMessage, `You must select exactly ${currentService.sessionsPerWeek} day(s).`);
            isValid = false;
        }

        selectedDays.forEach(day => {
            if (!selectedTimes[day]) {
                showModalError(timeErrorMessage, `Please select a time for ${day}.`);
                isValid = false;
            }
        });

        console.log('Validation result:', isValid);
        return isValid;
    };

    // Show error message in modal
    const showModalError = (element, message) => {
        if (element) {
            element.textContent = message;
            element.style.color = '#ff6b6b'; // Red color for errors
        }
    };

    // Clear error message in modal
    const clearModalError = (element) => {
        if (element) {
            element.textContent = '';
        }
    };

    // Clear all modal errors
    const clearModalErrors = () => {
        clearModalError(dayErrorMessage);
        clearModalError(timeErrorMessage);
    };

    // Use event delegation to listen for clicks on any "Add to Cart" button
    serviceGrid.addEventListener('click', e => {
        const button = e.target.closest('.service-btn');
        if (!button) return; // Exit if the click wasn't on a button

        // Find the parent card to get the service details
        const card = button.closest('.interactive-card');
        const name = card.querySelector('.service-title').textContent;
        const priceText = card.querySelector('.service-price').dataset.price; // Get from data-price
        const price = parseFloat(priceText);
        const serviceType = button.dataset.serviceType; // 'Group' or 'Private'
        const sessionsPerWeek = parseInt(button.dataset.sessionsPerWeek, 10); // 1 or 2

        openSessionModal(name, price, serviceType, sessionsPerWeek);
    });

    // Handle form submission from the session selection modal
    sessionSelectionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('Confirm Sessions button clicked.');

        if (validateSessionSelection()) {
            const id = currentService.name.replace(/\s+/g, '-').toLowerCase();
            const sessions = selectedDays.map(day => ({
                day: day,
                time: selectedTimes[day]
            }));

            console.log('Attempting to add to cart with data:', {
                id: id,
                name: currentService.name,
                price: currentService.price,
                type: currentService.type,
                sessionsPerWeek: currentService.sessionsPerWeek,
                sessions: sessions
            });

            // Call the globally exposed 'add' function from checkout.js
            if (window.chesserCart && typeof window.chesserCart.add === 'function') {
                window.chesserCart.add(id, currentService.name, currentService.price, currentService.type, currentService.sessionsPerWeek, sessions);
                console.log('window.chesserCart.add called successfully. Item should be added.');
            } else {
                console.error('Cart system (checkout.js) is not initialized or add function is missing.');
            }

            closeSessionModal();

            // Provide visual feedback to the user on the original button
            // This part might need slight adjustment if you have multiple buttons with same type/sessionsPerWeek
            // For more robust targeting, you might want to store the clicked button element in `currentService`
            const originalButton = serviceGrid.querySelector(`[data-service-type="${currentService.type}"][data-sessions-per-week="${currentService.sessionsPerWeek}"]`);
            if (originalButton) {
                const originalText = originalButton.textContent;
                originalButton.textContent = 'Added!';
                originalButton.disabled = true;
                setTimeout(() => {
                    originalButton.textContent = originalText;
                    originalButton.disabled = false;
                }, 1500);
            }
        } else {
            console.warn('Session selection validation failed.');
        }
    });

    // Close modal listeners
    closeSessionModalBtn?.addEventListener('click', closeSessionModal);
    sessionModalOverlay?.addEventListener('click', closeSessionModal);
})();