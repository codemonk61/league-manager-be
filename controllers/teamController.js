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
exports.createCustomTeam = exports.updateTeam = exports.deleteTeam = exports.getTeams = exports.generateTeams = void 0;
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
        hasVirtualPlayer: player1.isVirtual || player2.isVirtual,
        fee: "Not Paid",
        reEntry: 0,
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
const deleteTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield Team_1.Team.findByIdAndDelete(id);
        res.status(200).json({ message: "Team deleted", id: id });
    }
    catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});
exports.deleteTeam = deleteTeam;
const updateTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // 1. Validate team ID
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid team ID format" });
        }
        // 2. Validate update data
        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No update data provided" });
        }
        // 3. Handle player updates (if players data is included)
        if (updateData.players && Array.isArray(updateData.players)) {
            // Update each player document first
            const playerUpdates = updateData.players.map((player) => __awaiter(void 0, void 0, void 0, function* () {
                if (!mongoose_1.default.Types.ObjectId.isValid(player._id)) {
                    throw new Error(`Invalid player ID: ${player._id}`);
                }
                yield Player_1.Player.findByIdAndUpdate(player._id, {
                    name: player.name,
                    level: player.level
                }, { new: true, runValidators: true });
            }));
            yield Promise.all(playerUpdates);
            // Convert player objects to just IDs for team update
            updateData.players = updateData.players.map((player) => player._id);
        }
        // 4. Update the team document
        const updatedTeam = yield Team_1.Team.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true }).populate('players'); // Populate to return full player data
        if (!updatedTeam) {
            return res.status(404).json({ error: "Team not found" });
        }
        res.status(200).json({
            message: "Team updated successfully",
            team: updatedTeam
        });
    }
    catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({
            error: "Server error",
            details: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.updateTeam = updateTeam;
const createCustomTeam = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { players, teamName, pairType, reEntry, fee } = req.body;
        // Validate input
        if (!players || !Array.isArray(players)) {
            res.status(400).json({ error: "Players must be an array" });
            return;
        }
        if (!teamName || !pairType) {
            res.status(400).json({ error: "teamName and pairType are required" });
            return;
        }
        // Create new players in DB (optional: skip if players already exist)
        const createdPlayers = yield Player_1.Player.insertMany(players.map(player => ({
            name: player.name,
            level: player.level,
            isVirtual: false, // Mark as custom (non-virtual)
        })));
        // Extract player IDs
        const playerIds = createdPlayers.map(p => p._id);
        // Create the team
        const newTeam = new Team_1.Team({
            players: playerIds,
            teamName,
            pairType,
            hasVirtualPlayer: false,
            combinedStrength: 4,
            fee: fee,
            reEntry: reEntry
        });
        yield newTeam.save();
        res.status(201).json(newTeam);
    }
    catch (error) {
        console.error("Error creating custom team:", error);
        res.status(500).json({ error: "Server error" });
    }
});
exports.createCustomTeam = createCustomTeam;
