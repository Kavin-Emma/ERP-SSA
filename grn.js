// Table එකට Rows එකතු කිරීම (Render Loop එක ඇතුළත)
function renderGRNTable(grnList) {
    const tableBody = document.getElementById('grnTableBody'); // ඔබේ table body ID එක
    tableBody.innerHTML = '';

    grnList.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.supplier}</td>
            <td>${item.itemName}</td>
            <td>${item.quantity}</td>
            <td>${item.unitPrice}</td>
            <td>${item.quantity * item.unitPrice}</td>
            <td class="action-cell">
                <button onclick="cancelGRN(${item.id})" class="btn btn-danger">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Cancel Function එක
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

        const data = await response.json();

        if (response.ok && data.success) {
            alert('GRN Cancelled Successfully!');
            window.location.reload(); // Delete වූ පසු Page එක Reload වේ
        } else {
            alert('Failed to cancel GRN: ' + (data.message || 'Error occurred'));
        }
    } catch (error) {
        console.error('Error cancelling GRN:', error);
        alert('Server Connection Error while cancelling GRN: ' + error.message);
    }
}