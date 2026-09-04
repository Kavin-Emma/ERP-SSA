function renderInventoryTable(items) {
    const user = JSON.parse(localStorage.getItem('erp_user') || '{}');
    const tableBody = document.getElementById('inventoryTable');
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

function toggleStoresDropdown() {
    const menu = document.getElementById('storesMenu');
    const btn = document.querySelector('.stores-btn');
    
    menu.classList.toggle('show');
    btn.classList.toggle('active');
}

function toggleCuttingDropdown() {
    const menu = document.getElementById('cuttingMenu');
    const btn = document.querySelector('.cutting-btn');
    
    menu.classList.toggle('show');
    btn.classList.toggle('active');
}

function toggleproductionDropdown() {
    const menu = document.getElementById('productionMenu');
    const btn = document.querySelector('.production-btn');
    
    menu.classList.toggle('show');
    btn.classList.toggle('active');
}

function togglepackingDropdown() {
    const menu = document.getElementById('packingMenu');
    const btn = document.querySelector('.packing-btn');
    
    menu.classList.toggle('show');
    btn.classList.toggle('active');
}