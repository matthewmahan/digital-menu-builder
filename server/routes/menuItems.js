const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireMenuItemOwnership } = require('../middleware/auth');

const router = express.Router();

// Get all menu items for a company
router.get('/company/:companyId', authenticateToken, (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;

  const sql = `
    SELECT mi.*, c.name as company_name
    FROM menu_items mi
    JOIN companies c ON mi.company_id = c.id
    WHERE mi.company_id = ?
    ORDER BY mi.category, mi.name
  `;

  db.all(sql, [companyId], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ menuItems });
  });
});

// Get single menu item
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const menuItemId = req.params.id;

  const sql = `
    SELECT mi.*, c.name as company_name
    FROM menu_items mi
    JOIN companies c ON mi.company_id = c.id
    WHERE mi.id = ?
  `;

  db.get(sql, [menuItemId], (err, menuItem) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ menuItem });
  });
});

// Create new menu item
router.post('/', [
  body('company_id').isInt({ min: 1 }),
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('price').isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').optional().trim().isLength({ max: 50 }),
  body('image_url').optional().isURL(),
  body('is_available').optional().isBoolean()
], authenticateToken, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { 
      company_id, 
      name, 
      price, 
      description, 
      category = 'General',
      image_url,
      is_available = true 
    } = req.body;
    
    const db = getDatabase();

    // Verify company ownership
    db.get('SELECT owner_id FROM companies WHERE id = ?', [company_id], (err, company) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      if (company.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only add items to your own company.' });
      }

      // Create menu item
      const sql = `
        INSERT INTO menu_items (company_id, name, price, description, category, image_url, is_available)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [company_id, name, price, description, category, image_url, is_available], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create menu item' });
        }

        const menuItemId = this.lastID;

        // Get the created menu item
        db.get('SELECT * FROM menu_items WHERE id = ?', [menuItemId], (getErr, menuItem) => {
          if (getErr) {
            return res.status(500).json({ error: 'Failed to retrieve created menu item' });
          }

          res.status(201).json({
            message: 'Menu item created successfully',
            menuItem
          });
        });
      });
    });
  } catch (error) {
    console.error('Menu item creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update menu item
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('category').optional().trim().isLength({ max: 50 }),
  body('image_url').optional().isURL(),
  body('is_available').optional().isBoolean()
], authenticateToken, requireMenuItemOwnership, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const menuItemId = req.params.id;
    const { name, price, description, category, image_url, is_available } = req.body;
    const db = getDatabase();

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(price);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (category !== undefined) {
      updates.push('category = ?');
      values.push(category);
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }
    if (is_available !== undefined) {
      updates.push('is_available = ?');
      values.push(is_available);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(menuItemId);

    const sql = `UPDATE menu_items SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update menu item' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      // Get the updated menu item
      db.get('SELECT * FROM menu_items WHERE id = ?', [menuItemId], (getErr, menuItem) => {
        if (getErr) {
          return res.status(500).json({ error: 'Failed to retrieve updated menu item' });
        }

        res.json({
          message: 'Menu item updated successfully',
          menuItem
        });
      });
    });
  } catch (error) {
    console.error('Menu item update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete menu item
router.delete('/:id', authenticateToken, requireMenuItemOwnership, (req, res) => {
  const db = getDatabase();
  const menuItemId = req.params.id;

  db.run('DELETE FROM menu_items WHERE id = ?', [menuItemId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete menu item' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      message: 'Menu item deleted successfully',
      changes: this.changes
    });
  });
});

// Get menu items by category
router.get('/company/:companyId/category/:category', authenticateToken, (req, res) => {
  const db = getDatabase();
  const { companyId, category } = req.params;

  const sql = `
    SELECT mi.*, c.name as company_name
    FROM menu_items mi
    JOIN companies c ON mi.company_id = c.id
    WHERE mi.company_id = ? AND mi.category = ?
    ORDER BY mi.name
  `;

  db.all(sql, [companyId, category], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ menuItems });
  });
});

// Get available menu items only
router.get('/company/:companyId/available', authenticateToken, (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;

  const sql = `
    SELECT mi.*, c.name as company_name
    FROM menu_items mi
    JOIN companies c ON mi.company_id = c.id
    WHERE mi.company_id = ? AND mi.is_available = 1
    ORDER BY mi.category, mi.name
  `;

  db.all(sql, [companyId], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ menuItems });
  });
});

module.exports = router; 