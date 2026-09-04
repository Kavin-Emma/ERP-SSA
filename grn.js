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

// GRN Auto ID Counter
let grnCounter = 1;

document.addEventListener('DOMContentLoaded', function () {
    const grnForm = document.getElementById('grnForm');

    if (grnForm) {
        grnForm.addEventListener('submit', function (e) {
            e.preventDefault(); // Page reload වීම නවත්වයි

            // Form Inputs ලබා ගැනීම (HTML එකට අනුව ID 'Itemcode' වේ)
            const itemCode = document.getElementById('Itemcode').value;
            const supplier = document.getElementById('supplier').value;
            const itemName = document.getElementById('itemName').value;
            const quantity = parseFloat(document.getElementById('quantity').value);
            const unitPrice = parseFloat(document.getElementById('unitPrice').value);

            const totalAmount = quantity * unitPrice;
            const today = new Date().toISOString().split('T')[0];

            const grnId = 'GRN-' + String(grnCounter).padStart(3, '0');
            grnCounter++;

            const tableBody = document.getElementById('grnTableBody');
            const newRow = document.createElement('tr');

            // Table Row එක සෑදීම
            newRow.innerHTML = `
                <td><strong>${grnId}</strong></td>
                <td>${itemCode}</td>
                <td>${supplier}</td>
                <td>${itemName}</td>
                <td>${quantity.toLocaleString()}</td>
                <td>LKR ${unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td><strong>LKR ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></td>
                <td>${today}</td>
                <td class="status-cell">
                    <span class="badge badge-active">Active</span>
                </td>
                <td class="action-cell">
                    <button type="button" class="btn-cancel" onclick="cancelGRN(this)">
                        <i class="fa-solid fa-xmark"></i> Cancel
                    </button>
                </td>
            `;

            tableBody.appendChild(newRow);
            grnForm.reset();
        });
    }
});

// GRN Cancel කිරීමේ Function එක
function cancelGRN(button) {
    if (confirm('Are you sure you want to cancel this GRN?')) {
        const row = button.closest('tr');
        row.classList.add('cancelled-row');

        const statusCell = row.querySelector('.status-cell');
        if (statusCell) {
            statusCell.innerHTML = '<span class="badge badge-cancelled">Cancelled</span>';
        }

        const actionCell = row.querySelector('.action-cell');
        if (actionCell) {
            actionCell.innerHTML = '<span class="text-disabled">Cancelled</span>';
        }
    }
}