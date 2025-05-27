"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerController_1 = require("../controllers/playerController");
const router = express_1.default.Router();
// POST /api/players - Add a new player
router.post("/", playerController_1.createPlayer);
// GET /api/players - Fetch all players
router.get("/", playerController_1.getPlayers);
// DELETE /api/players/:id - Delete a player
router.delete("/:id", playerController_1.deletePlayer);
exports.default = router;
