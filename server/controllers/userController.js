const db = require("../config/db");
const bcrypt = require("bcrypt");

// simple anon generator
function generateAnonName() {
    const rand = Math.floor(Math.random() * 10000);
    return "User" + rand;
}

exports.createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Generate anonymous name
        const anonymous_name = generateAnonName();

        // 4. Insert into DB
        const query = `
            INSERT INTO users (username, email, password_hash, anonymous_name)
            VALUES (?, ?, ?, ?)
        `;

        const [result] = await db.query(query, [username, email, hashedPassword, anonymous_name]);

        // 5. Response
        res.status(201).json({
            message: "User created successfully",
            user_id: result.insertId,
            anonymous_name
        });

    } catch (err) {
        console.error(err);

        // duplicate email/username
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        return res.status(500).json({
            message: "Database error"
        });
    }
};