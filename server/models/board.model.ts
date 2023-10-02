const mongoose2 = require("mongoose");
const board = mongoose2.Schema(
    {
        title: String,
        category: String,
        priority: String,
        description: String,
        dueDate: String,
        checklist: String,
        attachment: String,
        user: { type: mongoose2.Schema.Types.ObjectId, ref: "UserModel" }
    },
    { timestamps: true }
);
module.exports = mongoose2.model("BoardModel", board);