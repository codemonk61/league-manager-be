"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const playerRoutes_1 = __importDefault(require("./routes/playerRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/players", playerRoutes_1.default);
app.use("/api/teams", teamRoutes_1.default);
exports.default = app;
