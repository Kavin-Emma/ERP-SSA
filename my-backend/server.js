const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// Express JSON Parsing
app.use(express.json());

// CORS Config: ඕනෑම ස්ථානයක සිට එන Requests භාර ගැනීමට
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// Mock User Data (Admin & Staff)
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

// Mock Inventory Data
let inventory = [
    { id: 1, name: 'Laptop', sku: 'LP-001', stock: 10, price: 150000 },
    { id: 2, name: 'Mouse', sku: 'MS-002', stock: 3, price: 2500 }
];

// Mock GRN Data
let grnList = [
    { id: 1, supplier: "Apex Textiles", itemName: "Cotton Fabric", quantity: 500, unitPrice: 250, date: new Date() }
];

// Auth Middleware (JWT Verification)
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Token Required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
        }
        req.user = user;
        next();
    });
}

// Health Check Endpoint (Server එක ක්‍රියාත්මකදැයි බලන්න)
app.get('/', (req, res) => {
    res.send('ERP Backend API is running successfully!');
});

// 1. Authentication Route (Login)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }

    const user = users.find(u => u.email === email);

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name }, 
        JWT_SECRET, 
        { expiresIn: '8h' }
    );

    res.json({
        success: true,
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
});

// 2. Get All Inventory Items
app.get('/api/inventory', authenticateToken, (req, res) => {
    res.json({ success: true, data: inventory });
});

// 3. Add Inventory Item (Admin Only)
app.post('/api/inventory', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }

    const newItem = { id: Date.now(), ...req.body };
    inventory.push(newItem);
    res.json({ success: true, data: newItem });
});

// 4. Update Inventory Item (Admin Only)
app.put('/api/inventory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }

    const { id } = req.params;
    const index = inventory.findIndex(item => item.id == id);

    if (index !== -1) {
        inventory[index] = { ...inventory[index], ...req.body };
        return res.json({ success: true, data: inventory[index] });
    }

    res.status(404).json({ success: false, message: 'Item not found' });
});

// 5. Delete Inventory Item (Admin Only)
app.delete('/api/inventory/:id', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }

    const { id } = req.params;
    inventory = inventory.filter(item => item.id != id);
    res.json({ success: true, message: 'Item deleted successfully' });
});

// 6. Get All GRN Records
app.get('/api/grn', authenticateToken, (req, res) => {
    res.json({ success: true, data: grnList });
});

// 7. Add New GRN Record
app.post('/api/grn', authenticateToken, (req, res) => {
    const { supplier, itemName, quantity, unitPrice } = req.body;
    
    if (!supplier || !itemName || !quantity || !unitPrice) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newGRN = {
        id: grnList.length + 1,
        supplier,
        itemName,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        date: new Date()
    };

    grnList.push(newGRN);
    res.status(201).json({ success: true, message: "GRN saved successfully!", data: newGRN });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`ERP Server running on port ${PORT}`);
});