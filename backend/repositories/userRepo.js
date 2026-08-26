const db = require("../config/db");

class UserRepository {
  async findByEmail(email) {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0];
  }

  async createUser(email, passwordHash, roleId) {
    const result = await db.query(
      "INSERT INTO users (email, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, email, role_id, created_at",
      [email, passwordHash, roleId]
    );
    return result.rows[0];
  }

  async getRoleByName(roleName) {
    const result = await db.query("SELECT id FROM roles WHERE name = $1", [roleName]);
    return result.rows[0];
  }
}

module.exports = new UserRepository();
