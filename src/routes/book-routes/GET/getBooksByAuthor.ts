// #TODO DECIDE HOW WE WANT TO HANDLE MULTIPLE AUTHORS ON ONE BOOK IF LOOKING FOR A SPECIFIC AUTHOR AND VISE VERSA WHERE WE WANT TWO AUTHORS AND NOT ONE
// Maybe an issue of how spaces and commas are handled in the URL (maybe could be made better, but using convential url encoding right now)

import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();
const isStringProvided = validationFunctions.isStringProvided;

function validAuthorParam(
    request: Request,
    response: Response,
    next: NextFunction
) {
    let { authors } = request.params;

    // First decode the URL-encoded string (this will convert %2C to comma and %20 to space)
    authors = decodeURIComponent(authors)
        .replace(/\+/g, ' ') // Replace + with space
        .trim(); // Remove any leading/trailing whitespace

    request.params.authors = authors;

    if (isStringProvided(authors)) {
        next();
    } else {
        response.status(400).send({
            message:
                'Invalid or missing Author - The author name must be provided as a non-empty string.',
        });
    }
}

/**
 * @api {get} /books/author/:authors Request to retrieve books by author name
 *
 * @apiDescription Request to retrieve book entries using an author's name. Supports partial matches and multiple authors.
 *
 * @apiName GetBooksByAuthor
 * @apiGroup Books
 *
 * @apiParam {String} authors Author name(s). For multiple authors, separate with comma. Use + for spaces (e.g., "John+Smith" or "John+Smith%2CJane+Doe")
 *
 * @apiSuccess {Object[]} books Array of book entry objects
 * @apiSuccess {String} books.isbn13 The book's ISBN-13 number
 * @apiSuccess {String} books.title The book's title
 * @apiSuccess {String} books.authors The book's author(s)
 * @apiSuccess {String} books.publisher The book's publisher
 * @apiSuccess {Number} books.year The book's publication year
 *
 * @apiError (400: Invalid Author) {String} message "Invalid or missing Author - The author name must be provided as a non-empty string."
 * @apiError (404: Not Found) {String} message "No books found - No books match the provided author name."
 * @apiError (503: Database Error) {String} message "Service Unavailable - Unable to connect to the database, make sure the port is correct."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while fetching the books by author."
 */
router.get(
    '/author/:authors',
    validAuthorParam,
    async (request: Request, response: Response) => {
        const { authors } = request.params;

        try {
            // Split the authors string by comma and trim each author name
            const authorList = authors
                .split(',')
                .map((author) => author.trim());

            // Create a WHERE clause that checks for each author
            const theQuery = `
                SELECT * FROM Books 
                WHERE ${authorList
                    .map((_, index) => `authors ILIKE $${index + 1}`)
                    .join(' OR ')}
            `;

            // Create array of author names with wildcards for partial matching
            const theValues = authorList.map((author) => `%${author}%`);

            const theResult = await pool.query(theQuery, theValues);

            if (theResult.rows.length === 0) {
                return response.status(404).send({
                    message:
                        'No books found - No books match the provided author name.',
                });
            }
            return response.status(200).json(theResult.rows);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                response.status(503).send({
                    message:
                        'Service Unavailable - Unable to connect to the database, make sure the port is correct.',
                });
            } else {
                response.status(500).send({
                    message:
                        'Internal Server Error - An unexpected error occurred while fetching the books by author.',
                });
            }
        }
    }
);

export default router;
