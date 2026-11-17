const db = require('../config/db');

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT default_low_stock_threshold AS defaultLowStockThreshold FROM settings WHERE organization_id=?',
      [req.user.organizationId]
    );
    res.json({ defaultLowStockThreshold: rows[0]?.defaultLowStockThreshold ?? 5 });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const value = Number(req.body.defaultLowStockThreshold);
    if (!Number.isInteger(value) || value < 0 || value > 1000000) {
      return res.status(400).json({ message: 'Threshold must be a non-negative whole number.' });
    }
    await db.execute(
      `INSERT INTO settings (organization_id, default_low_stock_threshold) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE default_low_stock_threshold=VALUES(default_low_stock_threshold)`,
      [req.user.organizationId, value]
    );
    res.json({ message: 'Settings saved.', defaultLowStockThreshold: value });
  } catch (err) { next(err); }
};
