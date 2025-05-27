import { Request, Response } from "express";
import { Player } from "../models/Player";

export const createPlayer = async (req: Request, res: Response) => {
  try {
    const { name, level } = req.body;
    const player = new Player({ name, level });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(400).json({ error: "Failed to create player" });
  }
};

export const getPlayers = async (req: Request, res: Response) => {
  try {
    const players = await Player.find();
    res.status(200).json(players);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deletePlayer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Player.findByIdAndDelete(id);
    res.status(200).json({ message: "Player deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};