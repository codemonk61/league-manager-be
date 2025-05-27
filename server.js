"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const PORT = 5000;
const MONGO_URI = 'mongodb+srv://real-time-quiz:quiz-123@cluster0.svsbxjl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    app_1.default.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
})
    .catch((err) => console.error("MongoDB connection error:", err));
