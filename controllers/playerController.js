"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlayer = exports.getPlayers = exports.createPlayer = void 0;
const Player_1 = require("../models/Player");
const createPlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, level } = req.body;
        const player = new Player_1.Player({ name, level });
        yield player.save();
        res.status(201).json(player);
    }
    catch (error) {
        res.status(400).json({ error: "Failed to create player" });
    }
});
exports.createPlayer = createPlayer;
const getPlayers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield Player_1.Player.find();
        res.status(200).json(players);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getPlayers = getPlayers;
const deletePlayer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Player_1.Player.findByIdAndDelete(id);
        res.status(200).json({ message: "Player deleted" });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.deletePlayer = deletePlayer;
