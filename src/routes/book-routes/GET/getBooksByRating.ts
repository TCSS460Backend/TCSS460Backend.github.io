// MIGHT WANT TO LIMIT THE NUMBER OF BOOKS RETURNED

import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();
const isNumberProvided = validationFunctions.isNumberProvided;

function validRatingParam(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const { rating } = request.params;

    if (!isNumberProvided(rating)) {
        return response.status(400).send({
            message: 'Invalid or missing Rating - The rating must be a number.',
        });
    }

    const ratingNum = parseFloat(rating);
    if (ratingNum < 1 || ratingNum > 5 || isNaN(ratingNum)) {
        return response.status(400).send({
            message: 'Invalid Rating - The rating must be between 1 and 5.',
        });
    }

    request.params.rating = ratingNum.toFixed(2);
    return next();
}

/**
 * @api {get} /books/rating/:rating Request to retrieve books by average rating
 *
 * @apiDescription Request to retrieve book entries that match a specific average rating.
 *
 * @apiName GetBooksByRating
 * @apiGroup Books
 *
 * @apiParam {Number} rating The average rating to search for (between 1.00 and 5.00)
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
 * @apiError (400: Invalid Rating) {String} message "Invalid or missing Rating - The rating must be a number."
 * @apiError (400: Invalid Range) {String} message "Invalid Rating - The rating must be between 1 and 5."
 * @apiError (404: Not Found) {String} message "No books found with the specified rating."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while fetching the books by rating."
 */
router.get(
    '/rating/:rating',
    validRatingParam,
    async (request: Request, response: Response) => {
        const { rating } = request.params;

        try {
            const theQuery =
                'SELECT * FROM Books WHERE rating_avg = $1 ORDER BY rating_avg DESC';
            const theValues = [rating];
            const theResult = await pool.query(theQuery, theValues);

            if (theResult.rows.length === 0) {
                return response.status(404).send({
                    message: 'No books found with the specified rating.',
                });
            }

            return response.status(200).send(theResult.rows);
        } catch (error) {
            console.error('Error in getBooksByRating:', error);
            return response.status(500).send({
                message:
                    'Internal Server Error - An unexpected error occurred while fetching the books by rating.',
            });
        }
    }
);

export default router;
