// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://rajkumar:Raju2804@cluster0.xcmtzeg.mongodb.net/todo?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// user.js
// User.js

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

// Create Todo model
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send("Username already exists");
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering user");
  }
});
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username exists
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    // Check if the password is correct
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send("Invalid username or password");
    }

    // Generate and sign a JWT token
    const token = jwt.sign({ userId: user._id }, "secretkey");
    res.json(token);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
app.use(cors({ origin: "https://todo-d9mw.onrender.com" }));

function verifyToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).send("Invalid Token");
  }
}

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send("Username already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).send("Invalid username or password");

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).send("Invalid username or password");

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.header("Authorization", token).send(token);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});
// API endpoints
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching todos");
  }
});

app.get("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findById(id);
    if (!todo) {
      return res.status(404).send("Todo not found");
    }
    res.json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching todo");
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const todo = new Todo({ text: req.body.text });
    await todo.save();
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving todo");
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndUpdate(id, { text: req.body.text });
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating todo");
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Todo.findByIdAndDelete(id);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting todo");
  }
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
