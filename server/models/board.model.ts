const mongoose2 = require("mongoose");
const checklistItemSchema = new mongoose2.Schema({
  details: String,
  checked: Boolean,
});
const boardSchema = new mongoose2.Schema(
  {
    title: String,
    category: String,
    priority: String,
    description: String,
    dueDate: String,
    checklist: [checklistItemSchema],
    attachment: String,
    user: { type: mongoose2.Schema.Types.ObjectId, ref: "UserModel" },
  },
  { timestamps: true }
);
module.exports = mongoose2.model("BoardModel", boardSchema);
