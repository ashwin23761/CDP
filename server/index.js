require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const postsRoutes = require("./posts/posts.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/posts", postsRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});