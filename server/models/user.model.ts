const mongoose1 = require("mongoose");
const user = mongoose1.Schema(
    {
        name: String,
        email: String,
        password: { type: String, default: null },
        profilePicture: { type: String, default: null },
    }
);
module.exports = mongoose1.model("UserModel", user);