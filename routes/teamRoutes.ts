import express from "express";
import { generateTeams, getTeams } from "../controllers/teamController";
import asyncHandler from "express-async-handler";

const router = express.Router();

// POST /api/teams/generate - Generate balanced teams
router.post("/generate", asyncHandler(generateTeams));

// GET /api/teams - Fetch all teams (optional)
router.get("/", getTeams);

export default router;