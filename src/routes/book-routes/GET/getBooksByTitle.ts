import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();
const isStringProvided = validationFunctions.isStringProvided;

function validTitleParam(
    request: Request,
    response: Response,
    next: NextFunction
) {
    let { title } = request.params;

    title = decodeURIComponent(title).replace(/\+/g, ' ').trim();

    request.params.title = title;

    if (isStringProvided(title)) {
        next();
    } else {
        response.status(400).send({
            message:
                'Invalid or missing Title - The title must be provided as a non-empty string.',
        });
    }
}

/**
 * @api {get} /books/title/:title Request to retrieve books by title
 *
 * @apiDescription Request to retrieve book entries that match a specific title (partial matches supported)
 *
 * @apiName GetBooksByTitle
 * @apiGroup Books
 *
 * @apiParam {String} title The title to search for. Use + for spaces (e.g., "The+Great+Gatsby")
 *
 * @apiSuccess {Object[]} books Array of book entry objects
 * @apiSuccess {String} books.isbn13 The book's ISBN-13 number
 * @apiSuccess {String} books.title The book's title
 * @apiSuccess {String} books.authors The book's author(s)
 * @apiSuccess {String} books.publisher The book's publisher
 * @apiSuccess {Number} books.year The book's publication year
 *
 * @apiError (400: Invalid Title) {String} message "Invalid or missing Title - The title must be provided as a non-empty string."
 * @apiError (404: Not Found) {String} message "No books found - No books match the provided title."
 * @apiError (503: Database Error) {String} message "Service Unavailable - Unable to connect to the database, make sure the port is correct."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while fetching the books by title."
 */
router.get(
    '/title/:title',
    validTitleParam,
    async (request: Request, response: Response) => {
        const { title } = request.params;

        try {
            const theQuery = 'SELECT * FROM Books WHERE title ILIKE $1';
            const theValues = [`%${title}%`];
            const theResult = await pool.query(theQuery, theValues);

            if (theResult.rows.length === 0) {
                return response.status(404).send({
                    message:
                        'No books found - No books match the provided title.',
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
                        'Internal Server Error - An unexpected error occurred while fetching the books by title.',
                });
            }
        }
    }
);

export default router;
