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
var JWT = require("jsonwebtoken");
const secretKey = process.env.secretKey;
module.exports = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || null;
        let decoded = JWT.verify(token, secretKey);
        req.userId = decoded.userId;
        req.email = decoded.user;
        next();
    }
    catch (error) {
        res
            .status(500)
            .send({ msg: `Something went wrong inside middleware , ${error}` });
    }
});
