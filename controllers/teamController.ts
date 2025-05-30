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
        hasVirtualPlayer: player1.isVirtual || player2.isVirtual,
        fee: "Not Paid",
        reEntry: 0,
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


export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Team.findByIdAndDelete(id);
    res.status(200).json({ message: "Team deleted", id: id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};


export const updateTeam = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // 1. Validate team ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid team ID format" });
    }

    // 2. Validate update data
    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No update data provided" });
    }

    // 3. Handle player updates (if players data is included)
    if (updateData.players && Array.isArray(updateData.players)) {
      // Update each player document first
      const playerUpdates = updateData.players.map(async (player: any) => {
        if (!mongoose.Types.ObjectId.isValid(player._id)) {
          throw new Error(`Invalid player ID: ${player._id}`);
        }

        await Player.findByIdAndUpdate(
          player._id,
          { 
            name: player.name,
            level: player.level 
          },
          { new: true, runValidators: true }
        );
      });

      await Promise.all(playerUpdates);

      // Convert player objects to just IDs for team update
      updateData.players = updateData.players.map((player: any) => player._id);
    }

    // 4. Update the team document
    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('players'); // Populate to return full player data

    if (!updatedTeam) {
      return res.status(404).json({ error: "Team not found" });
    }

    res.status(200).json({
      message: "Team updated successfully",
      team: updatedTeam
    });

  } catch (error) {
    console.error("Error updating team:", error);
    res.status(500).json({ 
      error: "Server error",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};


export const createCustomTeam = async (req: Request, res: Response): Promise<void> => {
 
  try {
    const { players, teamName, pairType, reEntry , fee} = req.body;

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
    const createdPlayers = await Player.insertMany(
      players.map(player => ({
        name: player.name,
        level: player.level,
        isVirtual: false, // Mark as custom (non-virtual)
      }))
    );

    // Extract player IDs
    const playerIds = createdPlayers.map(p => p._id);

    // Create the team
    const newTeam = new Team({
      players: playerIds,
      teamName,
      pairType,
      hasVirtualPlayer: false,
      combinedStrength: 4,
      fee: fee, 
      reEntry: reEntry
    });
    await newTeam.save();
    res.status(201).json(newTeam);

  } catch (error) {
    console.error("Error creating custom team:", error);
    res.status(500).json({ error: "Server error" });
  }
};