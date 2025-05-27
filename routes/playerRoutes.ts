import express from "express";
import {
  createPlayer,
  getPlayers,
  deletePlayer,
} from "../controllers/playerController";

const router = express.Router();

// POST /api/players - Add a new player
router.post("/", createPlayer);

// GET /api/players - Fetch all players
router.get("/", getPlayers);

// DELETE /api/players/:id - Delete a player
router.delete("/:id", deletePlayer);

export default router;