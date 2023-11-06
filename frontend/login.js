document.addEventListener('DOMContentLoaded', function (event) {
    // Your login page JavaScript code here
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Send a request to the backend for authentication
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.status === 200) {
                // Redirect to the T-shirt customization page upon successful login
                window.location.href = './index.html';
            } else {
                // Handle login failure, display an error message, etc.
                console.error('Login failed');
            }
        } catch (error) {
            console.error('An error occurred: ' + error);
        }
    });

    // You can include other login page-specific code here
});
