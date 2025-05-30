import express from "express";
import { createCustomTeam, deleteTeam, generateTeams, getTeams, updateTeam } from "../controllers/teamController";
import asyncHandler from "express-async-handler";

const router = express.Router();

// POST /api/teams/generate - Generate balanced teams
router.post("/generate", asyncHandler(generateTeams));

// GET /api/teams - Fetch all teams (optional)
router.get("/", getTeams);

//  delete Team
router.delete('/:id', deleteTeam)

// update Team
router.put('/:id', updateTeam)

router.post("/custom", asyncHandler(createCustomTeam));

export default router;