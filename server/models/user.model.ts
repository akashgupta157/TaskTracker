const mongoose1 = require("mongoose");
const user = mongoose1.Schema(
    {
        name: String,
        email: String,
        password: { type: String, default: null },
        profilePicture: { type: String, default: null },
        boards: [{ type: mongoose1.Schema.Types.ObjectId, ref: "BoardModel" }]
    }
);
module.exports = mongoose1.model("UserModel", user);