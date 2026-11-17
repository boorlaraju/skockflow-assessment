const jwt = require('jsonwebtoken');

module.exports = (user) => jwt.sign(
  { userId: user.id, organizationId: user.organization_id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
);
