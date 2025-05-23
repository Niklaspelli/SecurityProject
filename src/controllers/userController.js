import { db } from "../config/db.js"; // Adjust the import based on your project structure

export const getCompleteUserProfile = (req, res) => {
  const userId = req.user?.id;
  console.log("User ID from JWT:", userId); // Log the userId

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sql = `
      SELECT 
        u.id,
        u.username, 
        u.avatar,     
        p.sex,
        p.relationship_status,
        p.location,
        p.music_taste,
        p.interest,
        p.bio,
        (
          SELECT COUNT(*) 
          FROM friend_requests 
          WHERE (sender_id = u.id OR receiver_id = u.id) AND status = 'accepted'
        ) AS numberOfFriends
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `;

  console.log("SQL Query:", sql); // To check the data
  console.log("SQL Params:", [userId]);

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching complete user profile:", err.message);
      return res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }

    console.log("Query Result:", result); // Log the result for debugging
    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result[0]);
  });
};

// Get another user's profile
export const getOtherUserProfile = (req, res) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const sql = `
    SELECT 
      u.id,
      u.username, 
      u.avatar,     
      p.sex,
      p.relationship_status,
      p.location,
      p.music_taste,
      p.interest,
      p.bio,
      (
        SELECT COUNT(*) 
        FROM friend_requests 
        WHERE (sender_id = u.id OR receiver_id = u.id) AND status = 'accepted'
      ) AS numberOfFriends
    FROM users u
    LEFT JOIN user_profiles p ON u.id = p.user_id
    WHERE u.id = ?
  `;

  console.log("Running getOtherUserProfile for ID:", userId);

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Database error in getOtherUserProfile:", err.message);
      return res
        .status(500)
        .json({ error: "Database error", details: err.message });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result[0]);
  });
};

export const getUserById = (req, res) => {
  const { userId } = req.params;

  const sql = `
      SELECT 
        u.id,
        u.username,
        u.avatar,
        p.bio,
        p.sex,
        p.relationship_status,
        p.location,
        p.music_taste,
        p.interest,
        (
          SELECT COUNT(*) 
          FROM friend_requests 
          WHERE (sender_id = u.id OR receiver_id = u.id) AND status = 'accepted'
        ) AS numberOfFriends
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `;

  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching user by ID:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(result[0]);
  });
};

// Endpoint to search for users by a username (case-insensitive, partial match)
export const searchUser = (req, res) => {
  const { username } = req.params;

  // Validate the username
  if (!username || username.trim().length === 0) {
    return res.status(400).json({ error: "Username is required" });
  }

  // SQL query to fetch users whose usernames match the search term (case-insensitive, partial match)
  const sql = `
    SELECT
      u.id, 
      u.username,
      u.avatar
    FROM users u
    WHERE LOWER(u.username) LIKE LOWER(?) 
  `;

  // Add the search term with '%' for partial matching
  const searchTerm = `${username}%`; // Starts with the search term

  db.query(sql, [searchTerm], (err, result) => {
    if (err) {
      console.error("Error fetching user by username:", err.message);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // If no users were found, return a 404 response
    if (result.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    // Send back the results (user profiles)
    res.status(200).json(result);
  });
};
