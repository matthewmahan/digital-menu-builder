const express = require('express');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { authenticateToken, requireCompanyOwnership } = require('../middleware/auth');

const router = express.Router();

// Get company details
router.get('/:id', authenticateToken, (req, res) => {
  const db = getDatabase();
  const companyId = req.params.id;

  const sql = `
    SELECT c.*, u.first_name as owner_name
    FROM companies c
    JOIN users u ON c.owner_id = u.id
    WHERE c.id = ?
  `;

  db.get(sql, [companyId], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  });
});

// Create new company (for first-time users)
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('logo_url').optional().isURL()
], authenticateToken, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { name, description, logo_url } = req.body;
    const userId = req.user.id;
    const db = getDatabase();

    // Check if user already has a company
    db.get('SELECT id FROM companies WHERE owner_id = ?', [userId], async (err, existingCompany) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingCompany) {
        return res.status(400).json({ error: 'User already has a company' });
      }

      // Generate unique menu link
      const menuId = uuidv4();
      const menuLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/menu/${menuId}`;

      // Generate QR code
      let qrCodeUrl = null;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(menuLink, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeUrl = qrCodeDataUrl;
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        // Continue without QR code if generation fails
      }

      // Create company
      const sql = `
        INSERT INTO companies (name, description, logo_url, owner_id, qr_code_url, menu_link)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [name, description, logo_url, userId, qrCodeUrl, menuLink], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create company' });
        }

        const companyId = this.lastID;

        // Update user's company_id and is_first_login
        db.run(`
          UPDATE users 
          SET company_id = ?, is_first_login = 0, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [companyId, userId], (updateErr) => {
          if (updateErr) {
            console.error('Error updating user:', updateErr);
          }

          res.status(201).json({
            message: 'Company created successfully',
            company: {
              id: companyId,
              name,
              description,
              logo_url,
              qr_code_url: qrCodeUrl,
              menu_link: menuLink
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Company creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('logo_url').optional().isURL()
], authenticateToken, requireCompanyOwnership, (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const companyId = req.params.id;
    const { name, description, logo_url } = req.body;
    const db = getDatabase();

    // Build update query dynamically
    const updates = [];
    const values = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (logo_url !== undefined) {
      updates.push('logo_url = ?');
      values.push(logo_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(companyId);

    const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`;

    db.run(sql, values, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update company' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Get the updated company data
      db.get('SELECT * FROM companies WHERE id = ?', [companyId], (getErr, company) => {
        if (getErr) {
          return res.status(500).json({ error: 'Failed to retrieve updated company' });
        }

        res.json({
          message: 'Company updated successfully',
          company: company
        });
      });
    });
  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's company
router.get('/my/company', authenticateToken, (req, res) => {
  const db = getDatabase();
  const userId = req.user.id;

  const sql = `
    SELECT c.*, u.first_name as owner_name
    FROM companies c
    JOIN users u ON c.owner_id = u.id
    WHERE c.owner_id = ?
  `;

  db.get(sql, [userId], (err, company) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!company) {
      return res.status(404).json({ error: 'No company found for this user' });
    }

    res.json({ company });
  });
});

// Regenerate QR code
router.post('/:id/regenerate-qr', authenticateToken, requireCompanyOwnership, async (req, res) => {
  try {
    const companyId = req.params.id;
    const db = getDatabase();

    // Get company's menu link
    db.get('SELECT menu_link FROM companies WHERE id = ?', [companyId], async (err, company) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Generate new QR code
      let qrCodeUrl = null;
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(company.menu_link, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        qrCodeUrl = qrCodeDataUrl;
      } catch (qrError) {
        console.error('QR code generation error:', qrError);
        return res.status(500).json({ error: 'Failed to generate QR code' });
      }

      // Update company with new QR code
      db.run(
        'UPDATE companies SET qr_code_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [qrCodeUrl, companyId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update QR code' });
          }

          res.json({
            message: 'QR code regenerated successfully',
            qr_code_url: qrCodeUrl
          });
        }
      );
    });
  } catch (error) {
    console.error('QR code regeneration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 