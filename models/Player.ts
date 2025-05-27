import { Schema, model } from "mongoose";

interface IPlayer {
  name: string;
  level: "Pro" | "Medium" | "Noob";
  isVirtual?: boolean;
}

const playerSchema = new Schema<IPlayer>({
  name: { type: String, required: true },
  level: { type: String, enum: ["Pro", "Medium", "Noob"], required: true },
  isVirtual: { type: Boolean, required: false },
});

export const Player = model<IPlayer>("Player", playerSchema);