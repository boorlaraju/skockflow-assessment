const db = require('../config/db');

exports.summary = async (req, res, next) => {
  try {
    const orgId = req.user.organizationId;
    const [[settings]] = await db.execute(
      'SELECT default_low_stock_threshold AS defaultThreshold FROM settings WHERE organization_id=?',
      [orgId]
    );
    const threshold = settings?.defaultThreshold ?? 5;
    const [[summary]] = await db.execute(
      `SELECT COUNT(*) AS totalProducts, COALESCE(SUM(quantity_on_hand), 0) AS totalUnits
       FROM products WHERE organization_id=?`, [orgId]
    );
    const [lowStockItems] = await db.execute(
      `SELECT id, name, sku, quantity_on_hand AS quantityOnHand,
              COALESCE(low_stock_threshold, ?) AS lowStockThreshold
       FROM products
       WHERE organization_id=? AND quantity_on_hand <= COALESCE(low_stock_threshold, ?)
       ORDER BY quantity_on_hand ASC, name ASC LIMIT 10`,
      [threshold, orgId, threshold]
    );
    res.json({ totalProducts: Number(summary.totalProducts), totalUnits: Number(summary.totalUnits), lowStockCount: lowStockItems.length, lowStockItems, defaultThreshold: threshold });
  } catch (err) { next(err); }
};
