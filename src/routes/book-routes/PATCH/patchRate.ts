import express, { Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {patch} /books/rate/:isbn Request to alter a book's ratings by ISBN
 *
 * @apiDescription Request to add a rating a book's ratings using its ISBN-13 number. Individual ratings
 * are optional, though at least one rating must be provided else a 400 error will be returned. To
 * altar other book data see patchUpdateBook.
 *
 * @apiName patchRate
 * @apiGroup Books
 *
 * @apiParam {String} isbn A 13-digit ISBN number
 *
 * @apiBody {Number} stars The rating between 1 & 5 inclusive
 * @apiBody {Boolean} [remove] Whether the review should be added or removed. Handles any truthy or falsy value. Defaults to false -> add rating
 *
 * @apiSuccess {String} message "Sucessfully updated book ratings."
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse ISBN to a valid number."
 * @apiError (400: Invalid Rating) {String} message "Invalid or missing rating."
 * @apiError (400: Invalid Rating) {String} message "Invalid rating value - must be between 1 and 5 inclusive."
 * @apiError (404: Not Found) {String} message "Book not found - No book matches the provided ISBN."
 * @apiError (400: Invalid Remove Status) {String} message "A star rating cannot have a negative count - Consider setting remove to false."
 *
 */
router.patch('/rate/:isbn', async (request: Request, response: Response) => {
    let { isbn } = request.params;
    isbn = isbn.trim();
    if (!isValidISBN(isbn)) {
        response.status(400).send({
            message:
                'Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string.',
        });
        return;
    }
    const numericIsbn = parseInt(isbn, 10);
    if (isNaN(numericIsbn)) {
        response.status(400).send({
            message:
                'Invalid ISBN format - Unable to parse ISBN to a valid number.',
        });
        return;
    }

    if (!isNumberProvided(request.body.stars)) {
        response.status(400).send({
            message: 'Invalid or missing rating.',
        });
    }
    const rating = parseInt(request.body.stars, 10);
    if (rating > 5 || rating < 1) {
        response.status(400).send({
            message:
                'Invalid rating value - must be between 1 and 5 inclusive.',
        });
    }

    try {
        const values = [numericIsbn];
        const selectQuery = `SELECT rating_count, rating_1_star, rating_2_star,
                                rating_3_star, rating_4_star, rating_5_star
                                FROM Books
                                WHERE isbn13 = $1`;
        const selectResult = await pool.query(selectQuery, values);
        if (selectResult.rows.length === 0) {
            return response.status(404).send({
                message: 'Book not found - No book matches the provided ISBN.',
            });
        }
        if (selectResult.rows.length > 1) {
            return response.status(500).send({
                message: 'Server Error - Multiple books returned for ISBN.',
            });
        }
        let rating1Star = selectResult.rows[0].rating_1_Star;
        let rating2Star = selectResult.rows[0].rating_2_Star;
        let rating3Star = selectResult.rows[0].rating_3_Star;
        let rating4Star = selectResult.rows[0].rating_4_Star;
        let rating5Star = selectResult.rows[0].rating_5_Star;
        const addOrRemove = request.body.remove ? -1 : 1; //Accepts any truthy or falsy value without issue, if left empty defaults to false -> add 1
        switch (rating) {
            case 1:
                rating1Star += addOrRemove;
                break;
            case 2:
                rating2Star += addOrRemove;
                break;
            case 3:
                rating3Star += addOrRemove;
                break;
            case 4:
                rating4Star += addOrRemove;
                break;
            case 5:
                rating5Star += addOrRemove;
                break;
            default:
                return response.status(500).send({
                    message: 'Server Error - Contact support',
                });
        }
        if (addOrRemove < 0) {
            if (
                rating1Star < 0 ||
                rating2Star < 0 ||
                rating3Star < 0 ||
                rating4Star < 0 ||
                rating5Star < 0
            ) {
                response.status(400).send({
                    message:
                        'A star rating cannot have a negative count - Consider setting remove to false.',
                });
                return;
            }
        }
        const ratingCount = selectResult.rows[0].rating_count + addOrRemove;
        const ratingAvg =
            (rating1Star +
                2 * rating2Star +
                3 * rating3Star +
                4 * rating4Star +
                5 * rating5Star) /
            ratingCount;

        const theQuery = `UPDATE Books
                SET rating_avg = $2, rating_count = $3,
                    rating_1_star = $4, rating_2_star = $5,
                    rating_3_star = $6,rating_4_star = $7,
                    rating_5_star = $8
                WHERE isbn13 = $1`;
        const updateValues = [
            numericIsbn,
            ratingAvg,
            ratingCount,
            rating1Star,
            rating2Star,
            rating3Star,
            rating4Star,
            rating5Star,
        ];

        const theResult = await pool.query(theQuery, updateValues);
        if (theResult.rowCount === 0) {
            /*
             * ISBN existence confirmed by previous query. Possible error if record is deleted
             * between query calls - hence duplicate 404.
             */
            return response.status(404).send({
                message: 'Book not found - No book matches the provided ISBN.',
            });
        }
        if (theResult.rowCount > 1) {
            return response.status(500).send({
                message: 'Server Error - Multiple records updated.',
            });
        }
        response.status(200).send({
            message: 'Sucessfully updated book ratings.',
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            response.status(503).send({
                message:
                    'Service Unavailable - Unable to connect to the database make sure the port is correct.',
            });
        } else {
            response.status(500).send({
                message:
                    'Internal Server Error - An unexpected error occurred while fetching the book data.',
            });
        }
    }
});

export default router;
