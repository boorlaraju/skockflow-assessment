const db = require('../config/db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, sku, description, quantity_on_hand AS quantityOnHand,
              cost_price AS costPrice, selling_price AS sellingPrice,
              low_stock_threshold AS lowStockThreshold, created_at AS createdAt,
              updated_at AS updatedAt
       FROM products WHERE organization_id = ? ORDER BY updated_at DESC`,
      [req.user.organizationId]
    );
    res.json({ products: rows });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, name, sku, description, quantity_on_hand AS quantityOnHand,
              cost_price AS costPrice, selling_price AS sellingPrice,
              low_stock_threshold AS lowStockThreshold
       FROM products WHERE id = ? AND organization_id = ?`,
      [req.params.id, req.user.organizationId]
    );
    if (!rows.length) return res.status(404).json({ message: 'Product not found.' });
    res.json({ product: rows[0] });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, sku, description, quantityOnHand = 0, costPrice, sellingPrice, lowStockThreshold } = req.body;
    if (!name?.trim() || !sku?.trim()) return res.status(400).json({ message: 'Product name and SKU are required.' });
    if (!Number.isInteger(Number(quantityOnHand)) || Number(quantityOnHand) < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }
    const [result] = await db.execute(
      `INSERT INTO products
       (organization_id, name, sku, description, quantity_on_hand, cost_price, selling_price, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.organizationId, name.trim(), sku.trim(), description || null, Number(quantityOnHand),
       costPrice === '' || costPrice == null ? null : Number(costPrice),
       sellingPrice === '' || sellingPrice == null ? null : Number(sellingPrice),
       lowStockThreshold === '' || lowStockThreshold == null ? null : Number(lowStockThreshold)]
    );
    res.status(201).json({ message: 'Product created.', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This SKU already exists in your organization.' });
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, sku, description, quantityOnHand, costPrice, sellingPrice, lowStockThreshold } = req.body;
    if (!name?.trim() || !sku?.trim()) return res.status(400).json({ message: 'Product name and SKU are required.' });
    if (!Number.isInteger(Number(quantityOnHand)) || Number(quantityOnHand) < 0) {
      return res.status(400).json({ message: 'Quantity must be a non-negative integer.' });
    }
    const [result] = await db.execute(
      `UPDATE products SET name=?, sku=?, description=?, quantity_on_hand=?, cost_price=?, selling_price=?, low_stock_threshold=?
       WHERE id=? AND organization_id=?`,
      [name.trim(), sku.trim(), description || null, Number(quantityOnHand),
       costPrice === '' || costPrice == null ? null : Number(costPrice),
       sellingPrice === '' || sellingPrice == null ? null : Number(sellingPrice),
       lowStockThreshold === '' || lowStockThreshold == null ? null : Number(lowStockThreshold),
       req.params.id, req.user.organizationId]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product updated.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'This SKU already exists in your organization.' });
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM products WHERE id=? AND organization_id=?', [req.params.id, req.user.organizationId]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted.' });
  } catch (err) { next(err); }
};
