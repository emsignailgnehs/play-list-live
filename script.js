document.addEventListener('DOMContentLoaded', function() {
    // Fetch and render concerts
    fetch('concerts.json')
        .then(response => response.json())
        .then(concerts => {
            const concertList = document.querySelector('.concert-list');
            concertList.innerHTML = ''; // Clear existing content
            concerts.forEach(concert => {
                const concertItem = document.createElement('div');
                concertItem.classList.add('concert-item');
                concertItem.innerHTML = `
                    <h3>${concert.title}</h3>
                    <p class="venue">${concert.venue}</p>
                    <p class="date">${concert.date}</p>
                    <details>
                        <summary>Read More (+)</summary>
                        <p class="description">${concert.description}</p>
                    </details>
                `;
                concertList.appendChild(concertItem);

                const detailsElement = concertItem.querySelector('details');
                const summaryElement = concertItem.querySelector('summary');

                detailsElement.addEventListener('toggle', () => {
                    if (detailsElement.open) {
                        summaryElement.textContent = 'Hide (-)';
                    } else {
                        summaryElement.textContent = 'Read More (+)';
                    }
                });
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateEmail()) {
            // Clear error
            errorMessage.textContent = '';
            emailInput.classList.remove('error');
            
            // Show success message
            successMessage.textContent = '✓ Thank you for signing up! Check your email for confirmation.';
            
            // Reset form after 3 seconds
            setTimeout(function() {
                form.reset();
                successMessage.textContent = '';
            }, 3000);
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