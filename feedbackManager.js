const fs = require("fs");
const path = require("path");

class FeedbackManager {
  constructor() {
    this.feedbackDir = path.join(__dirname, "data", "feedback");
    this.ensureFeedbackDirectory();
  }

  ensureFeedbackDirectory() {
    if (!fs.existsSync(this.feedbackDir)) {
      fs.mkdirSync(this.feedbackDir, { recursive: true });
    }
  }

  saveFeedback(feedback) {
    const timestamp = new Date().toISOString();
    const filename = `feedback-${timestamp.replace(/[:.]/g, "-")}.txt`;
    const feedbackFile = path.join(this.feedbackDir, filename);

    try {
      fs.writeFileSync(feedbackFile, feedback);
      return { success: true, message: "Feedback received" };
    } catch (error) {
      console.error("Error saving feedback:", error);
      throw new Error("Failed to save feedback");
    }
  }

  getAllFeedback() {
    try {
      if (!fs.existsSync(this.feedbackDir)) {
        return [];
      }

      const files = fs.readdirSync(this.feedbackDir);
      return files
        .map((filename) => {
          const content = fs.readFileSync(
            path.join(this.feedbackDir, filename),
            "utf8"
          );
          const timestamp = filename
            .replace("feedback-", "")
            .replace(".txt", "");
          return {
            id: filename,
            content,
            timestamp: timestamp
              .replace(/-/g, ":")
              .replace("T", "T")
              .replace("Z", "Z"),
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      console.error("Error reading feedback:", error);
      throw new Error("Failed to read feedback");
    }
  }

  deleteFeedback(id) {
    console.log("Attempting to delete feedback with ID:", id);
    const feedbackFile = path.join(this.feedbackDir, id);
    console.log("Full file path:", feedbackFile);

    try {
      // Check if directory exists
      if (!fs.existsSync(this.feedbackDir)) {
        console.error("Feedback directory does not exist:", this.feedbackDir);
        throw new Error("Feedback directory not found");
      }

      // Check if file exists
      if (!fs.existsSync(feedbackFile)) {
        console.error("Feedback file does not exist:", feedbackFile);
        throw new Error("Feedback not found");
      }

      // Try to delete the file
      try {
        fs.unlinkSync(feedbackFile);
        console.log("Successfully deleted file:", feedbackFile);
        return { success: true, message: "Feedback deleted successfully" };
      } catch (deleteError) {
        console.error("Error during file deletion:", deleteError);
        throw new Error("Failed to delete feedback file");
      }
    } catch (error) {
      console.error("Error in deleteFeedback:", error);
      throw error;
    }
  }
}

module.exports = new FeedbackManager();
