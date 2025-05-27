import { Schema, model, Types } from "mongoose";
import { Player } from "./Player";

interface ITeam {
  players: [Types.ObjectId, Types.ObjectId];
  combinedStrength: number;
}



// Update your Team schema to handle ObjectId arrays
const teamSchema = new Schema({
    players: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    combinedStrength: Number,
    teamName: String,
    pairType: String,
    createdAt: { type: Date, default: Date.now },
    hasVirtualPlayer: Boolean
});

export const Team = model<ITeam>("Team", teamSchema);