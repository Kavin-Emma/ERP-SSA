const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

const users = [
    {
        id: 1,
        email: 'admin@erp.com',
        passwordHash: bcrypt.hashSync('admin123', 10),
        name: 'System Admin',
        role: 'admin'
    },
    {
        id: 2,
        email: 'staff@erp.com',
        passwordHash: bcrypt.hashSync('staff123', 10),
        name: 'Store Staff',
        role: 'staff'
    }
];

let inventory = [
    { id: 1, name: 'Laptop', sku: 'LP-001', stock: 10, price: 150000 },
    { id: 2, name: 'Mouse', sku: 'MS-002', stock: 3, price: 2500 }
];

let grnList = [
    { id: 1, supplier: "Apex Textiles", itemName: "Cotton Fabric", quantity: 500, unitPrice: 250, date: new Date() }
];

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ success: false, message: 'Access Token Required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ success: false, message: 'Invalid Token' });
        req.user = user;
        next();
    });
}

// Auth Login Route
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });

    res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

// Inventory Routes
app.get('/api/inventory', authenticateToken, (req, res) => {
    res.json({ success: true, data: inventory });
});

app.post('/api/inventory', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized' });
    const newItem = { id: Date.now(), ...req.body };
    inventory.push(newItem);
    res.json({ success: true, data: newItem });
});

app.put('/api/inventory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    const index = inventory.findIndex(item => item.id == id);
    if (index !== -1) {
        inventory[index] = { ...inventory[index], ...req.body };
        return res.json({ success: true, data: inventory[index] });
    }
    res.status(404).json({ success: false, message: 'Item not found' });
});

app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Unauthorized' });
    const { id } = req.params;
    inventory = inventory.filter(item => item.id != id);
    res.json({ success: true, message: 'Item deleted' });
});

// GRN Routes
// GRN Routes
app.get('/api/grn', authenticateToken, (req, res) => {
    // Cancel නොවූ (Active) GRN පමණක් හෝ සියලුම GRN යැවීම
    res.json({ success: true, data: grnList });
});

app.post('/api/grn', authenticateToken, (req, res) => {
    const { supplier, itemName, quantity, unitPrice } = req.body;
    const newGRN = {
        id: grnList.length + 1,
        supplier,
        itemName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        status: 'Active', // Default status එක Active ලෙස සැකසීම
        date: new Date()
    };
    grnList.push(newGRN);
    res.status(201).json({ success: true, message: "GRN saved successfully!", data: newGRN });
});

// GRN Cancel කිරීම හෝ Delete කිරීම සඳහා නව Route එක
app.delete('/api/grn/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    
    // Memory Array එකෙන් GRN එක සම්පූර්ණයෙන්ම ඉවත් කිරීම
    grnList = grnList.filter(item => item.id != id);

    /* (සටහන: Array එකෙන් Delete කරන්නේ නැතිව Status එක 'Cancelled' කිරීමට අවශ්‍ය නම් පහත කේතය භාවිත කරන්න)
    const grn = grnList.find(item => item.id == id);
    if (grn) {
        grn.status = 'Cancelled';
    }
    */

    res.json({ success: true, message: "GRN Cancelled successfully!" });
});

app.listen(PORT, () => {
    console.log(`ERP Server running on port ${PORT}`);
});