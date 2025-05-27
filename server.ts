import mongoose from "mongoose";
import app from "./app";

const PORT =  5000;
const MONGO_URI = 'mongodb+srv://real-time-quiz:quiz-123@cluster0.svsbxjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));