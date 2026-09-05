document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('erp_token', data.token);
            localStorage.setItem('erp_user', JSON.stringify(data.user));

            alert('Login successful!');
            window.location.href = 'dashboard.html';
        } else {
            alert('Login failed: ' + (data.message || 'Invalid Credentials'));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Server Connection Error: ' + error.message);
    }
});