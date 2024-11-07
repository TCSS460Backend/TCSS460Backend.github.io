import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();
const isNumberProvided = validationFunctions.isNumberProvided;

function validYearParam(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { year } = request.params;

    if (!isNumberProvided(year)) {
        return response.status(400).send({
            message: 'Invalid or missing Year - The year must be a number.',
        });
    }

    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();

    if (yearNum < 1000 || yearNum > currentYear || isNaN(yearNum)) {
        return response.status(400).send({
            message: `Invalid Year - The year must be between 1000 and ${currentYear}.`,
        });
    }

    request.params.year = yearNum.toString();
    return next();
}

/**
 * @api {get} /books/year/:year Request to retrieve books by publication year
 *
 * @apiDescription Request to retrieve book entries that match a specific publication year
 *
 * @apiName GetBooksByPublicationYear
 * @apiGroup Books
 *
 * @apiParam {Number} year The publication year to search for
 *
 * @apiSuccess {Object[]} books Array of book entry objects
 * @apiSuccess {String} books.isbn13 The book's ISBN-13 number
 * @apiSuccess {String} books.title The book's title
 * @apiSuccess {String} books.authors The book's author(s)
 * @apiSuccess {Number} books.average_rating The book's average rating
 * @apiSuccess {Number} books.ratings_count Total number of ratings
 * @apiSuccess {String} books.image_url URL to the book's cover image
 * @apiSuccess {Number} books.original_publication_year Year of original publication
 *
 * @apiError (400: Invalid Year) {String} message "Invalid or missing Year - The year must be a number."
 * @apiError (400: Invalid Range) {String} message "Invalid Year - The year must be between 1000 and current_year."
 * @apiError (404: Not Found) {String} message "No books found with the specified publication year."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while fetching the books."
 */
router.get(
    '/year/:year',
    validYearParam,
    async (request: Request, response: Response) => {
        const { year } = request.params;

        try {
            const theQuery =
                'SELECT * FROM Books WHERE publication_year = $1 ORDER BY title ASC';
            const theValues = [year];
            const theResult = await pool.query(theQuery, theValues);

            if (theResult.rows.length === 0) {
                return response.status(404).send({
                    message:
                        'No books found with the specified publication year.',
                });
            }

            return response.status(200).send(theResult.rows);
        } catch (error) {
            console.error('Error in getBooksByPublicationYear:', error);
            return response.status(500).send({
                message:
                    'Internal Server Error - An unexpected error occurred while fetching the books.',
            });
        }
    }
);

export default router;
