const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

function requireCompanyOwnership(req, res, next) {
  const db = getDatabase();
  const companyId = req.params.companyId || req.body.company_id;
  const userId = req.user.id;

  if (!companyId) {
    return res.status(400).json({ error: 'Company ID required' });
  }

  const sql = 'SELECT owner_id FROM companies WHERE id = ?';
  
  db.get(sql, [companyId], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    if (company.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify your own company.' });
    }
    
    next();
  });
}

function requireMenuItemOwnership(req, res, next) {
  const db = getDatabase();
  const menuItemId = req.params.id;
  const userId = req.user.id;

  if (!menuItemId) {
    return res.status(400).json({ error: 'Menu item ID required' });
  }

  const sql = `
    SELECT mi.id, c.owner_id 
    FROM menu_items mi 
    JOIN companies c ON mi.company_id = c.id 
    WHERE mi.id = ?
  `;
  
  db.get(sql, [menuItemId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!result) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    if (result.owner_id !== userId) {
      return res.status(403).json({ error: 'Access denied. You can only modify menu items from your own company.' });
    }
    
    next();
  });
}

function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      first_name: user.first_name,
      company_id: user.company_id,
      subscription_tier: user.subscription_tier
    }, 
    JWT_SECRET, 
    { expiresIn: '7d' }
  );
}

module.exports = {
  authenticateToken,
  requireCompanyOwnership,
  requireMenuItemOwnership,
  generateToken
}; 