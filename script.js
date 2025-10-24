document.addEventListener('DOMContentLoaded', function() {
    // Helper function to format date and time
    function formatConcertDateTime(dateString, timeString) {
        const date = new Date(`${dateString}T${timeString}`);
        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        };
        return date.toLocaleString('en-US', options);
    }

    // Fetch list of genres and cache as a variable
    const genres = [];
    fetch('list_of_genres.json')
        .then(response => response.json())
        .then(data => {
            genres.push(...data);
        })
        .catch(error => console.error('Error fetching genres:', error));

    // Fetch list of event categories and cache as a variable
    const eventCategories = [];
    fetch('list_of_event_categories.json')
        .then(response => response.json())
        .then(data => {
            eventCategories.push(...data);
        })
        .catch(error => console.error('Error fetching event categories:', error));

    function getGenreNameById(id) {
        const genre = genres.find(g => g.id === id);
        return genre ? genre.name : 'Unknown Genre';
    }

    function getEventCategoryNameById(id) {
        // loop through eventCategories to find matching id
        for (let i = 0; i < eventCategories.length; i++) {
            if (eventCategories[i].id === id) {
                return eventCategories[i].name;
            }
        }
        return 'Unknown Category';
    }

    function renderConcertItem(concertItem) {
        // console.log(concertItem);
        const concertItemDiv = document.createElement('div');
        concertItemDiv.classList.add('concert-item');
        concertItemDiv.innerHTML = `
            <span class="event-type">${getEventCategoryNameById(concertItem.description.event_type)}</span>
            <br/>
            <span class="city">${concertItem.city}</span>
            <h3>${concertItem.band}</h3>
            <p class="venue">${concertItem.venue_name}</p>
            <p class="date">${formatConcertDateTime(concertItem.date_of_show, concertItem.time_of_show)}</p>
            <div class="genre-badges-container">
                ${concertItem.description && concertItem.description.band && concertItem.description.band.genre ? concertItem.description.band.genre.map(genreId => `<span class="genre-badge">${getGenreNameById(genreId)}</span>`).join('') : ''}
            </div>
            <details>
                <summary>Read More (+)</summary>
                <p class="description">${concertItem.description && concertItem.description.band && concertItem.description.band.summary ? concertItem.description.band.summary : ''}</p>
            </details>
        `;
        const detailsElement = concertItemDiv.querySelector('details');
        const summaryElement = concertItemDiv.querySelector('summary');
        const cityElement = concertItemDiv.querySelector('.city');
        const eventTypeElement = concertItemDiv.querySelector('.event-type');
        // apply css class to badges
        cityElement.classList.add('city-badge');
        eventTypeElement.classList.add(`event-type-badge`);

        detailsElement.addEventListener('toggle', () => {
            if (detailsElement.open) {
                summaryElement.textContent = 'Hide (-)';
            } else {
                summaryElement.textContent = 'Read More (+)';
            }
        });
        return concertItemDiv;
    }

    // Fetch and render concerts
    fetch('concerts.json')
        .then(response => response.json())
        .then(concerts => {
            const concertList = document.querySelector('.concert-list');
            concertList.innerHTML = ''; // Clear existing content
            concerts.forEach(concert => {
                const concertItem = renderConcertItem(concert);
                concertList.appendChild(concertItem);
            });
        })
        .catch(error => console.error('Error fetching concerts:', error));

    // Email validation and form submission
    const form = document.getElementById('signup-form');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('email-error');
    const successMessage = document.getElementById('success-message');

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email on input
    emailInput.addEventListener('input', function() {
        validateEmail();
    });

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateEmail()) {
            // Clear error
            errorMessage.textContent = '';
            emailInput.classList.remove('error');
            
            try {
                // Fetch client IP address
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                const clientIp = ipData.ip;

                const email = emailInput.value.trim();

                // Prepare data as JSON
                const payload = {
                    email: email,
                    clientIp: clientIp
                };

                const deploymentId = 'AKfycbxs5CqsM3fOVYiqIZUmp41D4v6UaNoMSEEQ6AlfF_wrl7vFprjF_LeHGsoDe6aM7UA_9g';
                const url = `https://script.google.com/macros/s/${deploymentId}/exec?action=addRecord`; // Apps Script endpoint

                // Send data using fetch API
                const response = await fetch(url, {
                    redirect: 'follow',
                    method: 'POST',
                    headers: {
                        "Content-Type": "text/plain;charset=utf-8"
                    },
                    body: JSON.stringify(payload)
                });
                
                const data = await response.json();

                if (data.status === 'success') {
                    successMessage.textContent = '✓ Thank you for signing up! Check your email for confirmation.';
                    form.reset();
                    setTimeout(() => successMessage.textContent = '', 3000);
                } else {
                    errorMessage.textContent = data.message || 'An error occurred. Please try again.';
                    emailInput.classList.add('error');
                }
            } catch (error) {
                console.error('Error:', error);
                errorMessage.textContent = 'Network error. Please try again later.';
                emailInput.classList.add('error');
            }
        }
    });

    // Validate email function
    function validateEmail() {
        const email = emailInput.value.trim();
        
        if (email === '') {
            errorMessage.textContent = 'Email address is required';
            emailInput.classList.add('error');
            successMessage.textContent = '';
            return false;
        }
        
        if (!emailRegex.test(email)) {
            errorMessage.textContent = 'Please enter a valid email address';
            emailInput.classList.add('error');
            successMessage.textContent = '';
            return false;
        }
        
        // Valid email
        errorMessage.textContent = '';
        emailInput.classList.remove('error');
        return true;
    }
});