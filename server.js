const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';
const GRN_FILE = path.join(__dirname, 'grn.json');

// JSON File එකෙන් දත්ත Load කරන Function එක
function loadGRNData() {
    try {
        if (fs.existsSync(GRN_FILE)) {
            const data = fs.readFileSync(GRN_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error reading file:", err);
    }
    return [
        { 
            id: 1, 
            itemCode: "ITM-001", 
            supplier: "Apex Textiles", 
            itemName: "Cotton Fabric", 
            quantity: 500, 
            unitPrice: 250, 
            status: "Active", 
            date: new Date() 
        }
    ];
}

// දත්ත File එකට Save කරන Function එක
function saveGRNData() {
    try {
        fs.writeFileSync(GRN_FILE, JSON.stringify(grnList, null, 2), 'utf8');
    } catch (err) {
        console.error("Error saving file:", err);
    }
}

// Users දත්ත
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
    },
    {
        id: 3,
        email: 'Kavindu@erp.com',
        passwordHash: bcrypt.hashSync('Kavindu41', 10),
        name: 'Kavindu',
        role: 'Data Entry'
    }     
];

// Inventory දත්ත
let inventory = [
    { id: 1, name: 'Fabric', sku: 'LP-001', stock: 10, price: 150000 },
    { id: 2, name: 'Care Label', sku: 'MS-002', stock: 3, price: 2500 }
];

// GRN List එක Load කරගැනීම (එක් වරක් පමණක් Declare කර ඇත)
let grnList = loadGRNData();

// Auth Middleware
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

// Login Route
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
app.get('/api/grn', authenticateToken, (req, res) => {
    res.json({ success: true, data: grnList });
});

app.post('/api/grn', authenticateToken, (req, res) => {
    const { itemCode, supplier, itemName, quantity, unitPrice } = req.body;
    const newGRN = {
        id: Date.now(),
        itemCode: itemCode || `ITM-00${grnList.length + 1}`,
        supplier,
        itemName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        status: 'Active',
        date: new Date()
    };
    grnList.push(newGRN);
    saveGRNData(); // File එකට Save කිරීම

    res.status(201).json({ success: true, message: "GRN saved successfully!", data: newGRN });
});

app.delete('/api/grn/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = grnList.length;

    grnList = grnList.filter(item => Number(item.id) !== id);

    if (grnList.length < initialLength) {
        saveGRNData(); // Delete වූ විට Update කිරීම
        res.json({ success: true, message: "GRN Cancelled successfully!" });
    } else {
        res.status(404).json({ success: false, message: "GRN item not found!" });
    }
});

// Server Listener
app.listen(PORT, '0.0.0.0', () => {
    console.log(`ERP Server running on port ${PORT}`);
});