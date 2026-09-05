const API_BASE_URL = 'https://erp-ssa-production.up.railway.app/api';

// Dropdown Menu Toggle Function
function toggleDropdown(menuId, btnElement) {
    const selectedMenu = document.getElementById(menuId);
    
    document.querySelectorAll('.dropdown-content').forEach(menu => {
        if (menu.id !== menuId) {
            menu.classList.remove('show');
        }
    });

    document.querySelectorAll('.menu-dropdown-btn').forEach(btn => {
        if (btn !== btnElement) {
            btn.classList.remove('active');
        }
    });

    if (selectedMenu) {
        selectedMenu.classList.toggle('show');
        btnElement.classList.toggle('active');
    }
}

// Document Load වූ පසු GRN ලැයිස්තුව Load කිරීම සහ Form Listener එක යෙදීම
document.addEventListener('DOMContentLoaded', function () {
    fetchGRNs(); // Backend එකෙන් පවතින GRN ලැයිස්තුව ලබා ගැනීම

    const grnForm = document.getElementById('grnForm');

    if (grnForm) {
        grnForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const token = localStorage.getItem('erp_token');
            if (!token) {
                alert('Session expired. Please login again.');
                window.location.href = 'index.html';
                return;
            }

            const itemCode = document.getElementById('Itemcode').value;
            const supplier = document.getElementById('supplier').value;
            const itemName = document.getElementById('itemName').value;
            const quantity = parseFloat(document.getElementById('quantity').value);
            const unitPrice = parseFloat(document.getElementById('unitPrice').value);

            const grnData = {
                itemCode,
                supplier,
                itemName,
                quantity,
                unitPrice
            };

            try {
                // Railway Backend එකට POST Request යැවීම
                const response = await fetch(`${API_BASE_URL}/grn`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(grnData)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert('GRN saved successfully!');
                    grnForm.reset();
                    fetchGRNs(); // Table එක Refresh කිරීම
                } else {
                    alert('Failed to save GRN: ' + (result.message || 'Error occurred'));
                }
            } catch (error) {
                console.error('Error saving GRN:', error);
                alert('Server Connection Error!');
            }
        });
    }
});

// Backend එකෙන් සියලුම GRN ලබාගෙන Table එකට පෙන්වන Function එක
async function fetchGRNs() {
    const token = localStorage.getItem('erp_token');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/grn`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (response.ok && result.success) {
            renderGRNTable(result.data);
        } else {
            console.error('Failed to fetch GRNs:', result.message);
        }
    } catch (error) {
        console.error('Error fetching GRNs:', error);
    }
}

// Table එක Render කරන Function එක
function renderGRNTable(grnList) {
    const tableBody = document.getElementById('grnTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!grnList || grnList.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center;">No GRNs found.</td></tr>`;
        return;
    }

    grnList.forEach((grn, index) => {
        const row = document.createElement('tr');
        const grnId = 'GRN-' + String(grn.id || index + 1).padStart(3, '0');
        const totalAmount = Number(grn.quantity) * Number(grn.unitPrice);
        const grnDate = grn.date ? new Date(grn.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

        row.innerHTML = `
            <td><strong>${grnId}</strong></td>
            <td>${grn.itemCode || 'N/A'}</td>
            <td>${grn.supplier}</td>
            <td>${grn.itemName}</td>
            <td>${Number(grn.quantity).toLocaleString()}</td>
            <td>LKR ${Number(grn.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            <td><strong>LKR ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
            <td>${grnDate}</td>
            <td class="status-cell">
                <span class="badge badge-active">Active</span>
            </td>
            <td class="action-cell">
                <button type="button" class="btn-cancel" onclick="cancelGRN(this)">
                    <i class="fa-solid fa-xmark"></i> Cancel
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// GRN Cancel කිරීමේ Function එක
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
            throw new Error(`Server status ${response.status}: ${rawText.substring(0, 100)}`);
        }

        if (response.ok && data.success) {
            alert('GRN Cancelled Successfully!');
            if (typeof loadGRNList === 'function') {
                loadGRNList();
            } else {
                window.location.reload();
            }
        } else {
            alert('Failed to cancel GRN: ' + (data.message || 'Error occurred'));
        }
    } catch (error) {
        console.error('Error cancelling GRN:', error);
        alert('Server Connection Error while cancelling GRN: ' + error.message);
    }
}