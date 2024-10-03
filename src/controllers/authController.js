import bcrypt from "bcryptjs";
import { db } from "../config/db.js"; // Adjust this import according to your project structure
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const JWT_SECRET = process.env.JWT_SECRET; // Make sure this is defined in your .env file

// Register user
export const registerUser = async (req, res) => {
  const { user, pwd } = req.body; // Destructure username and password

  // Input validation
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ error: "Username and password are required!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(pwd, 10); // Hash the password
    const addUser = "INSERT INTO users (username, password) VALUES (?, ?)";

    db.query(addUser, [user, hashedPassword], (err, result) => {
      if (err) {
        console.error("Error inserting data:", err.message); // Log the error for debugging
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json({ id: result.insertId, user });
    });
  } catch (error) {
    console.error("Error hashing password:", error.message); // Log the error
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { user, pwd } = req.body; // Destructure username and password

  // Input validation
  if (!user || !pwd) {
    return res
      .status(400)
      .json({ error: "Username and password are required!" });
  }

  const sql = "SELECT * FROM users WHERE username = ?";

  db.query(sql, [user], async (err, result) => {
    if (err) {
      console.error("Error fetching data:", err.message); // Log the error
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(400).json({ error: "Invalid credentials!" });
    }

    const userRecord = result[0];

    try {
      // Compare the hashed password with the user input password
      const match = await bcrypt.compare(pwd, userRecord.password);
      if (match) {
        // Create JWT token if credentials are valid
        const payload = { id: userRecord.id, username: userRecord.username }; // Include user ID in payload
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({
          success: true,
          message: "Authenticated",
          token,
          username: userRecord.username,
          id: userRecord.id,
        });
      } else {
        return res.status(400).json({ error: "Invalid credentials!" });
      }
    } catch (err) {
      console.error("Error during password comparison:", err.message); // Log the error
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params; // Get the user ID from request parameters

  // Input validation
  if (!id) {
    return res.status(400).json({ error: "User ID is required!" });
  }

  try {
    const deleteUserQuery = "DELETE FROM users WHERE id = ?";

    // Return a promise for the query
    const result = await new Promise((resolve, reject) => {
      db.query(deleteUserQuery, [id], (err, result) => {
        if (err) {
          return reject(err); // Reject promise on error
        }
        resolve(result); // Resolve promise with result
      });
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.status(200).json({ message: "User successfully deleted!" });
  } catch (error) {
    console.error("Error processing delete request:", error.message); // Log the error
    res.status(500).json({ error: "Internal Server Error" });
  }
};
