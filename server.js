const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const port = 8008;
const app = express();

// ✅ Middleware (MUST be before routes)
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses form data

app.use(express.static(__dirname)); // Serve static files (like HTML)

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/students", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once("open", () => {
    console.log("✅ MongoDB connection successful");
});

// ✅ Define Schema Correctly
const userSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    Email: { type: String, required: true },
    PIN: { type: String, required: true }, // Keep as String to allow leading zeros
});

const User = mongoose.model("User", userSchema); // ✅ Use singular "User"

// ✅ Serve HTML File
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "m2.html"));
});

// ✅ Handle Form Submission with Debugging
app.post("/post", async (req, res) => {
    try {
        console.log("📥 Received Data:", req.body); // Log request body for debugging

        const { Username, Email, PIN } = req.body;

        if (!Username || !Email || !PIN) {
            console.log("❌ Missing fields - Check Form or Postman Request");
            return res.status(400).send("❌ Missing fields");
        }

        const user = new User({ Username, Email, PIN });

        await user.save();
        console.log("✅ User Data Saved:", { Username, Email, PIN });

        res.send("✅ Verified");
    } catch (error) {
        console.error("❌ Error saving data:", error);
        res.status(500).send("❌ Error saving data");
    }
});


// ✅ Start Server
app.listen(port, () => {
    console.log(`🚀 Server started on port ${port}`);
});


