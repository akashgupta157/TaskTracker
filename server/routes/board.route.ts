const router1 = require("express").Router();
const boardModel = require("../models/board.model");
import { Request, Response } from "express";
import { Document } from "mongoose";
interface Board {
    _id: string;
    title: string;
    category: string;
    priority: string;
    description: string;
    dueDate: string,
    checklist: string,
    attachment: string,
    user: string;
}
interface CustomRequest extends Request {
    userId: string;
}
router1.post('/', async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.userId;
        const { title, category, priority, description, dueDate, checklist, attachment } = req.body;
        const newBoard = new boardModel({
            title,
            category,
            priority,
            description,
            dueDate,
            checklist,
            attachment,
            user: userId,
        });
        await newBoard.save();
        res.status(201).json({ message: "Board created successfully", board: newBoard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while creating the board" });
    }
})
router1.get("/", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.userId;
        const priorityFilter = req.query.priority as string | undefined;
        const filter: Partial<Board & Document> = { user: userId };
        if (priorityFilter) {
            filter.priority = priorityFilter;
        }
        const boards = await boardModel.find(filter);
        res.status(200).json({ boards });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving boards" });
    }
});
router1.get("/:boardId", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.userId;
        const boardId = req.params.boardId;
        const board = await boardModel.findOne({ _id: boardId, user: userId });
        if (!board) {
            return res.status(404).json({ error: "Board not found or unauthorized" });
        }
        res.status(200).json({ board });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while retrieving the board" });
    }
});
router1.patch("/:boardId", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.userId;
        const boardId = req.params.boardId;
        const existingBoard = await boardModel.findOne({ _id: boardId, user: userId });
        if (!existingBoard) {
            return res.status(404).json({ error: "Board not found or unauthorized" });
        }
        const { title, category, priority, description, dueDate, checklist, attachment } = req.body;
        existingBoard.title = title || existingBoard.title;
        existingBoard.category = category || existingBoard.category;
        existingBoard.priority = priority || existingBoard.priority;
        existingBoard.description = description || existingBoard.description;
        existingBoard.dueDate = dueDate || existingBoard.dueDate;
        existingBoard.checklist = checklist || existingBoard.checklist;
        existingBoard.attachment = attachment || existingBoard.attachment;
        await existingBoard.save();
        res.status(200).json({ message: "Board updated successfully", board: existingBoard });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while updating the board" });
    }
});
router1.delete("/:boardId", async (req: CustomRequest, res: Response) => {
    try {
        const userId = req.userId;
        const boardId = req.params.boardId;
        const existingBoard = await boardModel.findOne({ _id: boardId, user: userId });
        if (!existingBoard) {
            return res.status(404).json({ error: "Board not found or unauthorized" });
        }
        await boardModel.deleteOne({ _id: boardId });
        res.status(200).json({ message: "Board deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while deleting the board" });
    }
});
module.exports = router1;
