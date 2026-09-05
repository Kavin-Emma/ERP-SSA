document.addEventListener('DOMContentLoaded', () => {
    loadGRNList();

    const grnForm = document.getElementById('grnForm');
    if (grnForm) {
        grnForm.addEventListener('submit', handleGRNSubmit);
    }
});

// 1. GRN ලැයිස්තුව Server එකෙන් Load කිරීම
async function loadGRNList() {
    const token = localStorage.getItem('erp_token');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('https://erp-ssa-production.up.railway.app/api/grn', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            renderGRNTable(data.data);
        } else {
            console.error('Failed to load GRN list:', data.message);
        }
    } catch (error) {
        console.error('Error loading GRN list:', error);
    }
}

// 2. Table එකට Data Render කිරීම
function renderGRNTable(grnList) {
    const tableBody = document.getElementById('grnTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    grnList.forEach(item => {
        const row = document.createElement('tr');
        const total = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.itemcode || '-'}</td>
            <td>${item.supplier || '-'}</td>
            <td>${item.itemName || '-'}</td>
            <td>${item.quantity || 0}</td>
            <td>${item.unitPrice || 0}</td>
            <td>${total}</td>
            <td>${formattedDate}</td>
            <td class="action-cell">
                <button onclick="cancelGRN(${item.id})" class="btn btn-danger">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 3. නව GRN එකක් එකතු කිරීම (Submit)
async function handleGRNSubmit(e) {
    e.preventDefault();
    const itemcode = document.getElementById('Item Code').value;
    const supplier = document.getElementById('supplier').value;
    const itemName = document.getElementById('itemName').value;
    const quantity = document.getElementById('quantity').value;
    const unitPrice = document.getElementById('unitPrice').value;

    const token = localStorage.getItem('erp_token');

    try {
        const response = await fetch('https://erp-ssa-production.up.railway.app/api/grn', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ supplier, itemName, quantity, unitPrice })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('GRN Added Successfully!');
            document.getElementById('grnForm').reset();
            loadGRNList();
        } else {
            alert('Failed to add GRN: ' + (data.message || 'Error occurred'));
        }
    } catch (error) {
        console.error('Error adding GRN:', error);
        alert('Server Connection Error while adding GRN');
    }
}

// 4. GRN එක Cancel / Delete කිරීම
async function cancelGRN(grnId) {
    if (!confirm('Are you sure you want to cancel this GRN?')) return;

    const token = localStorage.getItem('erp_token');

    try {
        const response = await fetch(`https://erp-ssa-production.up.railway.app/api/grn/${grnId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const contentType = response.headers.get('content-type');
        let data = {};

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const rawText = await response.text();
            throw new Error(`Server returned status ${response.status}: ${rawText.substring(0, 100)}`);
        }

        if (response.ok && data.success) {
            alert('GRN Cancelled Successfully!');
            loadGRNList(); // Delete වූ පසු ලැයිස්තුව නැවත Load වේ
        } else {
            alert('Failed to cancel GRN: ' + (data.message || 'Item not found'));
        }
    } catch (error) {
        console.error('Error cancelling GRN:', error);
        alert('Server Connection Error while cancelling GRN: ' + error.message);
    }
}