"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.booksRouter = void 0;
const express_1 = __importDefault(require("express"));
const getBooksByAuthor_1 = __importDefault(require("./GET/getBooksByAuthor"));
const getBooksByISBN_1 = __importDefault(require("./GET/getBooksByISBN"));
exports.booksRouter = express_1.default.Router();
// Combine routes using Router.use()
exports.booksRouter.use(getBooksByAuthor_1.default);
exports.booksRouter.use(getBooksByISBN_1.default);
// Add this temporary debug route
exports.booksRouter.get('/test', (req, res) => {
    res.send('Books router is working!');
});
//# sourceMappingURL=index.js.map