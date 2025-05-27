import express from "express";
import cors from "cors";
import playerRoutes from "./routes/playerRoutes";
import teamRoutes from "./routes/teamRoutes";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/players", playerRoutes);
app.use("/api/teams", teamRoutes);

export default app;