"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const mongoose_1 = require("mongoose");
const playerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    level: { type: String, enum: ["Pro", "Medium", "Noob"], required: true },
    isVirtual: { type: Boolean, required: false },
});
exports.Player = (0, mongoose_1.model)("Player", playerSchema);
