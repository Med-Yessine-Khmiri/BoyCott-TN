const express = require("express");
const cors = require("cors");
const path = require("path");
const feedbackManager = require("./feedbackManager");

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// API Routes
const apiRouter = express.Router();

// Middleware to ensure JSON responses for API routes
apiRouter.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Handle feedback submission
apiRouter.post("/feedback", (req, res) => {
  const feedback = req.body.feedback;
  if (!feedback) {
    return res.status(400).json({ error: "Feedback is required" });
  }

  try {
    const result = feedbackManager.saveFeedback(feedback);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all feedback for admin
apiRouter.get("/feedback", (req, res) => {
  try {
    const feedback = feedbackManager.getAllFeedback();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete feedback
apiRouter.delete("/feedback/:id", (req, res) => {
  const feedbackId = req.params.id;
  console.log("Received delete request for feedback:", feedbackId);

  try {
    const result = feedbackManager.deleteFeedback(feedbackId);
    console.log("Delete operation result:", result);
    res.json(result);
  } catch (error) {
    console.error("Error in delete endpoint:", error);
    res.status(404).json({ error: error.message });
  }
});

// Mount API routes
app.use("/api", apiRouter);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve data.js with correct MIME type
app.get("/data/data.js", (req, res) => {
  res.type("application/javascript");
  res.sendFile(path.join(__dirname, "data", "data.js"));
});

// Main route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Admin route
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({ error: "Something went wrong!" });
  }
  res.status(500).sendFile(path.join(__dirname, "index.html"));
});

// Handle 404 errors
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.status(404).sendFile(path.join(__dirname, "index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
