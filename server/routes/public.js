const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

// Get public menu by company ID (no authentication required)
router.get('/:companyId', (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;

  // Get company details
  const companySql = `
    SELECT id, name, description, logo_url, menu_link
    FROM companies 
    WHERE id = ?
  `;

  db.get(companySql, [companyId], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Get available menu items
    const menuItemsSql = `
      SELECT id, name, price, description, category, image_url
      FROM menu_items 
      WHERE company_id = ? AND is_available = 1
      ORDER BY category, name
    `;

    db.all(menuItemsSql, [companyId], (menuErr, menuItems) => {
      if (menuErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group menu items by category
      const menuByCategory = menuItems.reduce((acc, item) => {
        const category = item.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});

      res.json({
        company: {
          id: company.id,
          name: company.name,
          description: company.description,
          logo_url: company.logo_url
        },
        menu: menuByCategory,
        categories: Object.keys(menuByCategory),
        totalItems: menuItems.length
      });
    });
  });
});

// Get public menu by menu link UUID
router.get('/link/:menuId', (req, res) => {
  const db = getDatabase();
  const menuId = req.params.menuId;

  // Find company by menu link
  const companySql = `
    SELECT id, name, description, logo_url, menu_link
    FROM companies 
    WHERE menu_link LIKE ?
  `;

  const menuLinkPattern = `%${menuId}`;

  db.get(companySql, [menuLinkPattern], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    // Get available menu items
    const menuItemsSql = `
      SELECT id, name, price, description, category, image_url
      FROM menu_items 
      WHERE company_id = ? AND is_available = 1
      ORDER BY category, name
    `;

    db.all(menuItemsSql, [company.id], (menuErr, menuItems) => {
      if (menuErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Group menu items by category
      const menuByCategory = menuItems.reduce((acc, item) => {
        const category = item.category || 'General';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {});

      res.json({
        company: {
          id: company.id,
          name: company.name,
          description: company.description,
          logo_url: company.logo_url
        },
        menu: menuByCategory,
        categories: Object.keys(menuByCategory),
        totalItems: menuItems.length
      });
    });
  });
});

// Get menu categories for a company
router.get('/:companyId/categories', (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;

  const sql = `
    SELECT DISTINCT category
    FROM menu_items 
    WHERE company_id = ? AND is_available = 1
    ORDER BY category
  `;

  db.all(sql, [companyId], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const categoryList = categories.map(cat => cat.category || 'General');
    
    res.json({
      categories: categoryList,
      count: categoryList.length
    });
  });
});

// Get menu items by category for public view
router.get('/:companyId/category/:category', (req, res) => {
  const db = getDatabase();
  const { companyId, category } = req.params;

  const sql = `
    SELECT id, name, price, description, category, image_url
    FROM menu_items 
    WHERE company_id = ? AND category = ? AND is_available = 1
    ORDER BY name
  `;

  db.all(sql, [companyId, category], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      category,
      menuItems,
      count: menuItems.length
    });
  });
});

// Search menu items (public)
router.get('/:companyId/search', (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;
  const { q: searchQuery } = req.query;

  if (!searchQuery || searchQuery.trim().length === 0) {
    return res.status(400).json({ error: 'Search query required' });
  }

  const searchTerm = `%${searchQuery.trim()}%`;
  
  const sql = `
    SELECT id, name, price, description, category, image_url
    FROM menu_items 
    WHERE company_id = ? 
      AND is_available = 1 
      AND (name LIKE ? OR description LIKE ? OR category LIKE ?)
    ORDER BY category, name
  `;

  db.all(sql, [companyId, searchTerm, searchTerm, searchTerm], (err, menuItems) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({
      searchQuery: searchQuery.trim(),
      menuItems,
      count: menuItems.length
    });
  });
});

// Get company info for QR code display
router.get('/:companyId/info', (req, res) => {
  const db = getDatabase();
  const companyId = req.params.companyId;

  const sql = `
    SELECT id, name, description, logo_url, qr_code_url, menu_link
    FROM companies 
    WHERE id = ?
  `;

  db.get(sql, [companyId], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        logo_url: company.logo_url,
        qr_code_url: company.qr_code_url,
        menu_link: company.menu_link
      }
    });
  });
});

module.exports = router; 