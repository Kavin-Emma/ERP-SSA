document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        // Markdown formatting ඉවත් කර නිවැරදි API endpoint path එක ලබා දෙන්න:
        const response = await fetch('https://erp-ssa-production.up.railway.app/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Save Token and User Info to LocalStorage
            localStorage.setItem('erp_token', data.token);
            localStorage.setItem('erp_user', JSON.stringify(data.user));

            alert('Login successful!');
            window.location.href = 'dashboard.html'; // Dashboard එකට මාරු වීම
        } else {
            alert('Login failed: ' + (data.message || 'Invalid Credentials'));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('Server Connection Error!');
    }
});