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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeams = exports.generateTeams = void 0;
const Player_1 = require("../models/Player");
const Team_1 = require("../models/Team");
const mongoose_1 = __importDefault(require("mongoose"));
// Define team name combinations
const teamTypes = {
    'Pro-Noob': ['Dynamic Duo', 'Mentor-Rookie', 'Pro-Noob Alliance'],
    'Medium-Medium': ['Balanced Team', 'Middle Ground', 'Average Experts'],
    'Pro-VirtualNoob': ['Pro + AI Rookie', 'Expert with Virtual Partner'],
    'VirtualPro-Noob': ['AI Pro + Human Rookie', 'Simulated Expert Team'],
    'Medium-VirtualMedium': ['Hybrid Medium Team']
};
const generateTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const players = yield Player_1.Player.find().lean();
        // Categorize players by level
        const proPlayers = players.filter(p => p.level === 'Pro');
        const mediumPlayers = players.filter(p => p.level === 'Medium');
        const noobPlayers = players.filter(p => p.level === 'Noob');
        const teams = [];
        // 1. Create Pro-Noob pairs (priority pairing)
        const proNoobPairs = Math.min(proPlayers.length, noobPlayers.length);
        for (let i = 0; i < proNoobPairs; i++) {
            teams.push(createTeam(proPlayers[i], noobPlayers[i], 'Pro-Noob'));
        }
        // Remove paired players
        proPlayers.splice(0, proNoobPairs);
        noobPlayers.splice(0, proNoobPairs);
        // 2. Create Medium-Medium pairs
        const mediumPairs = Math.floor(mediumPlayers.length / 2);
        for (let i = 0; i < mediumPairs; i++) {
            teams.push(createTeam(mediumPlayers[i * 2], mediumPlayers[i * 2 + 1], 'Medium-Medium'));
        }
        mediumPlayers.splice(0, mediumPairs * 2);
        // 3. Handle remaining players with virtual partners
        // Remaining Pros get virtual Noobs
        proPlayers.forEach(pro => {
            teams.push(createTeam(pro, createVirtualPlayer('Noob'), 'Pro-VirtualNoob'));
        });
        // Remaining Noobs get virtual Pros
        noobPlayers.forEach(noob => {
            teams.push(createTeam(createVirtualPlayer('Pro'), noob, 'VirtualPro-Noob'));
        });
        // Single remaining Medium gets virtual Medium
        if (mediumPlayers.length === 1) {
            teams.push(createTeam(mediumPlayers[0], createVirtualPlayer('Medium'), 'Medium-VirtualMedium'));
        }
        const savedTeams = yield Team_1.Team.insertMany(teams);
        res.status(200).json({
            teams: savedTeams,
            stats: {
                proNoobPairs,
                mediumPairs,
                virtualPlayersUsed: proPlayers.length + noobPlayers.length + (mediumPlayers.length === 1 ? 1 : 0)
            }
        });
    }
    catch (error) {
        console.error("Team generation error:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.generateTeams = generateTeams;
const createVirtualPlayer = (level) => {
    return {
        _id: new mongoose_1.default.Types.ObjectId(), // Generate valid ObjectId
        name: `Virtual ${level}`,
        level,
        isVirtual: true
    };
};
const strengthValues = {
    Pro: 3,
    Medium: 2,
    Noob: 1
};
const createTeam = (player1, player2, pairType) => {
    // Convert string IDs to ObjectIds if needed
    const player1Id = typeof player1._id === 'string'
        ? new mongoose_1.default.Types.ObjectId(player1._id)
        : player1._id;
    const player2Id = typeof player2._id === 'string'
        ? new mongoose_1.default.Types.ObjectId(player2._id)
        : player2._id;
    return {
        players: [player1Id, player2Id],
        combinedStrength: strengthValues[player1.level] + strengthValues[player2.level],
        teamName: teamTypes[pairType][Math.floor(Math.random() * teamTypes[pairType].length)],
        pairType,
        createdAt: new Date(),
        hasVirtualPlayer: player1.isVirtual || player2.isVirtual
    };
};
const getTeams = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield Team_1.Team.find().populate("players");
        res.status(200).json(teams);
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.getTeams = getTeams;
