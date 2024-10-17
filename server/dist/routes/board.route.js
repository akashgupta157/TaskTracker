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
const router1 = require("express").Router();
const boardModel = require("../models/board.model");
router1.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const { title, category, priority, description, dueDate, checklist, attachment, } = req.body;
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
        yield newBoard.save();
        res
            .status(201)
            .json({ message: "Board created successfully", board: newBoard });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while creating the board" });
    }
}));
router1.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const boards = yield boardModel.find({ user: userId });
        res.status(200).json({ boards });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while retrieving boards" });
    }
}));
router1.patch("/:boardId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const boardId = req.params.boardId;
        const existingBoard = yield boardModel.findOne({
            _id: boardId,
            user: userId,
        });
        if (!existingBoard) {
            return res.status(404).json({ error: "Board not found or unauthorized" });
        }
        const { title, category, priority, description, dueDate, checklist, attachment, } = req.body;
        existingBoard.title = title || existingBoard.title;
        existingBoard.category = category || existingBoard.category;
        existingBoard.priority = priority || existingBoard.priority;
        existingBoard.description = description || existingBoard.description;
        existingBoard.dueDate = dueDate || existingBoard.dueDate;
        existingBoard.checklist = checklist || existingBoard.checklist;
        existingBoard.attachment = attachment || existingBoard.attachment;
        yield existingBoard.save();
        const boards = yield boardModel.find({ user: userId });
        res
            .status(200)
            .json({ message: "Board updated successfully", boards });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while updating the board" });
    }
}));
router1.delete("/:boardId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const boardId = req.params.boardId;
        const existingBoard = yield boardModel.findOne({
            _id: boardId,
            user: userId,
        });
        if (!existingBoard) {
            return res.status(404).json({ error: "Board not found or unauthorized" });
        }
        yield boardModel.deleteOne({ _id: boardId });
        res.status(200).json({ message: "Board deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res
            .status(500)
            .json({ error: "An error occurred while deleting the board" });
    }
}));
module.exports = router1;
