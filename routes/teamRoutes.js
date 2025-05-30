"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teamController_1 = require("../controllers/teamController");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = express_1.default.Router();
// POST /api/teams/generate - Generate balanced teams
router.post("/generate", (0, express_async_handler_1.default)(teamController_1.generateTeams));
// GET /api/teams - Fetch all teams (optional)
router.get("/", teamController_1.getTeams);
//  delete Team
router.delete('/:id', teamController_1.deleteTeam);
// update Team
router.put('/:id', teamController_1.updateTeam);
router.post("/custom", (0, express_async_handler_1.default)(teamController_1.createCustomTeam));
exports.default = router;
