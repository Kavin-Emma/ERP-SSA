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

        // Response එක JSON ද යන්න පරීක්ෂා කිරීම
        const contentType = response.headers.get('content-type');
        let data = {};
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const rawText = await response.text();
            throw new Error(`Server returned non-JSON response (${response.status}): ${rawText.substring(0, 100)}`);
        }

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