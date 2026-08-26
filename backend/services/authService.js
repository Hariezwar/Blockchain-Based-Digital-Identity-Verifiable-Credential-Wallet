const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const userRepo = require("../repositories/userRepo");

class AuthService {
  async register(email, password, roleName = "HOLDER") {
    const existingUser = await userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const role = await userRepo.getRoleByName(roleName);
    if (!role) {
      throw new Error("Invalid role");
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await userRepo.createUser(email, passwordHash, role.id);
    return newUser;
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.role_id },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return { token, user: { id: user.id, email: user.email, role_id: user.role_id } };
  }
}

module.exports = new AuthService();
