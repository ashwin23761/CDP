require("dotenv").config();
const express = require("express");
const cors = require("cors");

const db = require("./config/db");

const app = express();

// Routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupsRoutes = require("./routes/groupsRoutes");
const postsRoutes = require("./routes/postsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const votesRoutes = require("./routes/votesRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/votes", votesRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.send("CDP API Running");
});

app.get("/api", (req, res) => {
  res.send("CDP API Running");
});

// Test database connection endpoint
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT user_id, username, email, anonymous_name, created_at FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
