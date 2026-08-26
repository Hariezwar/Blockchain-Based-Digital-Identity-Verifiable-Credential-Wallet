const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await authService.register(email, password, role || "HOLDER");
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    if (error.message === "Email already registered" || error.message === "Invalid role") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Register Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const authData = await authService.login(email, password);
    res.status(200).json(authData);
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return res.status(401).json({ error: error.message });
    }
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
