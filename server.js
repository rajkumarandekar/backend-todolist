const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = 5000;

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

app.use(express.json());
app.use(cors({ origin: "https://todo-d9mw.onrender.com" }));

// User model
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

// Register a new user
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username is already registered
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    // Return a success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // Handle any errors
    console.error(error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare the entered password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Return the token
    res.status(200).json({ token });
  } catch (error) {
    // Handle any errors
    res.status(500).json({ message: "Login failed" });
  }
});

///// todos

const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find({});
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching todos");
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
