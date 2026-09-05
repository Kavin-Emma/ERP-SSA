const API_BASE_URL = 'https://erp-ssa-production.up.railway.app/api';

// Page එක Load වන විට Inventory Data ලබා ගැනීම
document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
});

// Backend එකෙන් Inventory Data ලබා ගැනීමේ Function එක
async function fetchInventory() {
    const token = localStorage.getItem('erp_token');

    if (!token) {
        alert('Session expired or unauthorized. Please login again.');
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/inventory`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            renderInventoryTable(data.data);
        } else {
            console.error('Failed to fetch inventory:', data.message);
            if (response.status === 401 || response.status === 403) {
                alert('Session expired. Please login again.');
                window.location.href = 'index.html';
            }
        }
    } catch (error) {
        console.error('Error fetching inventory:', error);
    }
}

// Table Rendering Function
function renderInventoryTable(items) {
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    const tableBody = document.getElementById('inventoryTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    if (!items || items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No items found.</td></tr>`;
        return;
    }

    items.forEach(item => {
        const row = document.createElement('tr');
        
        const isLowStock = item.stock <= 5;
        const statusClass = isLowStock ? 'status-low-stock' : 'status-in-stock';
        const statusText = isLowStock ? 'Low Stock' : 'In Stock';
        const totalVal = (item.stock * item.price).toLocaleString('en-US', { minimumFractionDigits: 2 });

        const actionBtns = user.role === 'admin' ? `
            <button class="btn btn-sm btn-warning" onclick="setupEdit(${item.id})">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${item.id})">Delete</button>
        ` : 'View Only';

        row.innerHTML = `
            <td>INV${String(item.id).padStart(6, '0')}</td>
            <td><strong>${item.name}</strong></td>
            <td>${item.stock}</td>
            <td>LKR ${Number(item.price).toLocaleString()}</td>
            <td>LKR ${totalVal}</td>
            <td><span class="status-pill ${statusClass}">${statusText}</span></td>
            <td>${actionBtns}</td>
        `;
        tableBody.appendChild(row);
    });
}

// UI Dropdown Functions
function toggleStoresDropdown() {
    const menu = document.getElementById('storesMenu');
    const btn = document.querySelector('.stores-btn');
    if (menu && btn) {
        menu.classList.toggle('show');
        btn.classList.toggle('active');
    }
}

function toggleCuttingDropdown() {
    const menu = document.getElementById('cuttingMenu');
    const btn = document.querySelector('.cutting-btn');
    if (menu && btn) {
        menu.classList.toggle('show');
        btn.classList.toggle('active');
    }
}

function toggleproductionDropdown() {
    const menu = document.getElementById('productionMenu');
    const btn = document.querySelector('.production-btn');
    if (menu && btn) {
        menu.classList.toggle('show');
        btn.classList.toggle('active');
    }
}

function togglepackingDropdown() {
    const menu = document.getElementById('packingMenu');
    const btn = document.querySelector('.packing-btn');
    if (menu && btn) {
        menu.classList.toggle('show');
        btn.classList.toggle('active');
    }
}