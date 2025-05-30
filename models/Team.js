"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Team = void 0;
const mongoose_1 = require("mongoose");
// Update your Team schema to handle ObjectId arrays
const teamSchema = new mongoose_1.Schema({
    players: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Player' }],
    combinedStrength: Number,
    teamName: String,
    pairType: String,
    createdAt: { type: Date, default: Date.now },
    hasVirtualPlayer: Boolean,
    reEntry: Number,
    fee: String
});
exports.Team = (0, mongoose_1.model)("Team", teamSchema);
