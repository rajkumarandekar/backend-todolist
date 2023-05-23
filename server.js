// Import required modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

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

// Create Todo model
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://todo-d9mw.onrender.com"); // Replace with your frontend domain
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
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
