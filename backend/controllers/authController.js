const bcrypt = require('bcryptjs');
const db = require('../config/db');
const makeToken = require('../utils/token');

exports.register = async (req, res, next) => {
  const { name, email, password, organizationName } = req.body;
  if (!email || !password || !organizationName) {
    return res.status(400).json({ message: 'Email, password and organization name are required.' });
  }
  if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters.' });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length) {
      await connection.rollback();
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    const [org] = await connection.execute('INSERT INTO organizations (name) VALUES (?)', [organizationName.trim()]);
    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await connection.execute(
      'INSERT INTO users (organization_id, name, email, password_hash) VALUES (?, ?, ?, ?)',
      [org.insertId, name?.trim() || null, email.toLowerCase().trim(), passwordHash]
    );
    await connection.execute('INSERT INTO settings (organization_id) VALUES (?)', [org.insertId]);
    await connection.commit();
    const account = { id: user.insertId, organization_id: org.insertId, email: email.toLowerCase().trim(), name: name || null, organizationName };
    res.status(201).json({ token: makeToken(account), user: account });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const [rows] = await db.execute(
      `SELECT u.id, u.organization_id, u.name, u.email, u.password_hash, o.name AS organizationName
       FROM users u JOIN organizations o ON o.id = u.organization_id WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );
    if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const user = rows[0];
    res.json({
      token: makeToken(user),
      user: { id: user.id, organization_id: user.organization_id, name: user.name, email: user.email, organizationName: user.organizationName }
    });
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.organization_id, o.name AS organizationName
       FROM users u JOIN organizations o ON o.id = u.organization_id WHERE u.id = ?`,
      [req.user.userId]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json({ user: rows[0] });
  } catch (err) { next(err); }
};
