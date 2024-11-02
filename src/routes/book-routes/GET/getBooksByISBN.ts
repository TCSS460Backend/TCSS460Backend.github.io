import express, { NextFunction, Request, Response, Router } from 'express';
import { pool } from '../../../core/utilities';

const router: Router = express.Router();

function validISBNParam(
    request: Request,
    response: Response,
    next: NextFunction
) {
    let { isbn } = request.params;
    isbn = isbn.trim();

    if (isbn && isbn.length === 13 && !isNaN(Number(isbn))) {
        next();
    } else {
        response.status(400).send({
            message: 'Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string.',
        });
    }
}

/**
 * @api {get} /books/isbn/:isbn Request to retrieve a book by ISBN
 * 
 * @apiDescription Request to retrieve a book entry using its ISBN-13 number
 * 
 * @apiName GetBookByISBN
 * @apiGroup Books
 * 
 * @apiParam {String} isbn A 13-digit ISBN number
 * 
 * @apiSuccess {Object} book The book entry object
 * @apiSuccess {String} book.isbn13 The book's ISBN-13 number
 * @apiSuccess {String} book.title The book's title
 * @apiSuccess {String} book.author The book's author
 * @apiSuccess {String} book.publisher The book's publisher
 * @apiSuccess {Number} book.year The book's publication year
 * 
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse ISBN to a valid number."
 * @apiError (404: Not Found) {String} message "Book not found - No book matches the provided ISBN."
 * @apiError (500: Data Error) {String} message "Data error - The book record is missing an ISBN."
 * @apiError (500: Data Error) {String} message "Data error - The book record is missing a title."
 * @apiError (503: Database Error) {String} message "Service Unavailable - Unable to connect to the database make sure the port is correct."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while fetching the book data."
 */
router.get(
    '/isbn/:isbn',
    validISBNParam,
    async (request: Request, response: Response) => {
        const { isbn } = request.params;

        try {
            const numericIsbn = parseInt(isbn, 10);

            if (isNaN(numericIsbn)) {
                return response.status(400).send({
                    message: 'Invalid ISBN format - Unable to parse ISBN to a valid number.',
                });
            }

            const theQuery = 'SELECT * FROM Books WHERE isbn13 = $1';
            const theValues = [numericIsbn];
            const theResult = await pool.query(theQuery, theValues);

            if (theResult.rows.length === 0) {
                return response.status(404).send({ message: 'Book not found - No book matches the provided ISBN.' });
            }
            if (theResult.rows[0].isbn13 === null) {
                return response.status(500).send({ message: 'Data error - The book record is missing an ISBN.' });
            }
            if (theResult.rows[0].title === null) {
                return response.status(500).send({ message: 'Data error - The book record is missing a title.' });
            }
            response.status(200).send(theResult.rows[0]);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                response.status(503).send({
                    message: 'Service Unavailable - Unable to connect to the database make sure the port is correct.',
                });
            } else {
                response.status(500).send({
                    message: 'Internal Server Error - An unexpected error occurred while fetching the book data.',
                });
            }
        }
    }
);

export default router;
