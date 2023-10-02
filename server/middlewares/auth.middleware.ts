var JWT = require("jsonwebtoken");
const secretKey = process.env.secretKey;
module.exports  = async (req: any, res: any, next: any) => {
    try {
        let token = req.headers.authorization?.split(" ")[1] || null;
        let decoded = JWT.verify(token, secretKey);
        req.userId = decoded.userId;
        req.email = decoded.user;
        next();
    } catch (error) {
        res
            .status(500)
            .send({ msg: `Something went wrong inside middleware , ${error}` });
    }
};