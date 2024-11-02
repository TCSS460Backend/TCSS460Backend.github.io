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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const utilities_1 = require("../../../core/utilities");
const router = express_1.default.Router();
const isStringProvided = utilities_1.validationFunctions.isStringProvided;
function validAuthorParam(request, response, next) {
    const { authors } = request.params;
    if (isStringProvided(authors)) {
        next();
    }
    else {
        response.status(400).send({
            message: 'Invalid or missing Author - The author name must be provided as a non-empty string.',
        });
    }
}
router.get('/author/:authors', validAuthorParam, (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    const { authors } = request.params;
    try {
        const theQuery = 'SELECT * FROM Books WHERE authors ILIKE $1';
        const theValues = [`%${authors}%`];
        const theResult = yield utilities_1.pool.query(theQuery, theValues);
        if (theResult.rows.length === 0) {
            return response.status(404).send({
                message: 'No books found - No books match the provided author name.',
            });
        }
        response.status(200).send(theResult.rows);
    }
    catch (error) {
        if (error.code === 'ECONNREFUSED') {
            response.status(503).send({
                message: 'Service Unavailable - Unable to connect to the database, make sure the port is correct.',
            });
        }
        else {
            response.status(500).send({
                message: 'Internal Server Error - An unexpected error occurred while fetching the books by author.',
            });
        }
    }
}));
exports.default = router;
//# sourceMappingURL=getBooksByAuthor.js.map