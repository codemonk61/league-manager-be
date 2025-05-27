import { Request, Response } from 'express';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import mongoose from 'mongoose';

// Define all possible pair types
type TeamPairType = 
  | 'Pro-Noob' 
  | 'Medium-Medium'
  | 'Pro-VirtualNoob'
  | 'VirtualPro-Noob'
  | 'Medium-VirtualMedium';

// Define team name combinations
const teamTypes: Record<TeamPairType, string[]> = {
    'Pro-Noob': ['Dynamic Duo', 'Mentor-Rookie', 'Pro-Noob Alliance'],
    'Medium-Medium': ['Balanced Team', 'Middle Ground', 'Average Experts'],
    'Pro-VirtualNoob': ['Pro + AI Rookie', 'Expert with Virtual Partner'],
    'VirtualPro-Noob': ['AI Pro + Human Rookie', 'Simulated Expert Team'],
    'Medium-VirtualMedium': ['Hybrid Medium Team']
};

type PlayerLevel = 'Pro' | 'Medium' | 'Noob';
type PlayerType = {
    _id: any;
    name: string;
    level: PlayerLevel;
    isVirtual?: boolean;
};

export const generateTeams = async (req: Request, res: Response): Promise<void> => {
    try {
        const players = await Player.find().lean() as PlayerType[];

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
            teams.push(createTeam(
                mediumPlayers[i * 2], 
                mediumPlayers[i * 2 + 1],
                'Medium-Medium'
            ));
        }
        mediumPlayers.splice(0, mediumPairs * 2);

        // 3. Handle remaining players with virtual partners
        // Remaining Pros get virtual Noobs
        proPlayers.forEach(pro => {
            teams.push(createTeam(
                pro,
                createVirtualPlayer('Noob'),
                'Pro-VirtualNoob'
            ));
        });

        // Remaining Noobs get virtual Pros
        noobPlayers.forEach(noob => {
            teams.push(createTeam(
                createVirtualPlayer('Pro'),
                noob,
                'VirtualPro-Noob'
            ));
        });

        // Single remaining Medium gets virtual Medium
        if (mediumPlayers.length === 1) {
            teams.push(createTeam(
                mediumPlayers[0],
                createVirtualPlayer('Medium'),
                'Medium-VirtualMedium'
            ));
        }

        const savedTeams = await Team.insertMany(teams);
        res.status(200).json({
            teams: savedTeams,
            stats: {
                proNoobPairs,
                mediumPairs,
                virtualPlayersUsed: proPlayers.length + noobPlayers.length + (mediumPlayers.length === 1 ? 1 : 0)
            }
        });

    } catch (error) {
        console.error("Team generation error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

const createVirtualPlayer = (level: PlayerLevel): PlayerType => {
    return {
        _id: new mongoose.Types.ObjectId(), // Generate valid ObjectId
        name: `Virtual ${level}`,
        level,
        isVirtual: true
    };
};

const strengthValues: Record<PlayerLevel, number> = {
    Pro: 3,
    Medium: 2,
    Noob: 1
};



const createTeam = (
    player1: PlayerType,
    player2: PlayerType,
    pairType: TeamPairType
) => {
    // Convert string IDs to ObjectIds if needed
    const player1Id = typeof player1._id === 'string' 
        ? new mongoose.Types.ObjectId(player1._id) 
        : player1._id;
    
    const player2Id = typeof player2._id === 'string' 
        ? new mongoose.Types.ObjectId(player2._id) 
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

export const getTeams = async (req: Request, res: Response) => {
    try {
        const teams = await Team.find().populate("players");
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
};