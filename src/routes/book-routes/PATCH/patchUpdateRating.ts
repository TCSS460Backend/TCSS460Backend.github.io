import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isDefined = validationFunctions.isDefined;
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {patch} /books/update/ratings/:isbn Request to alter a book's ratings by ISBN
 *
 * @apiDescription Request to altar a book's ratings using its ISBN-13 number. Individual ratings
 * are optional, though at least one new rating must be provided else a 400 error will be returned.
 * To altar other book data see (Patch)Request to alter a book's data by ISBN.
 *
 * @apiName patchUpdateRatings
 * @apiGroup Books
 *
 * @apiParam {String} isbn A 13-digit ISBN number
 *
 * @apiBody {Number} [rating_1_star] The count of 1 star ratings
 * @apiBody {Number} [rating_2_star] The count of 2 star ratings
 * @apiBody {Number} [rating_3_star] The count of 3 star ratings
 * @apiBody {Number} [rating_4_star] The count of 4 star ratings
 * @apiBody {Number} [rating_5_star] The count of 5 star ratings
 *
 * @apiSuccess {String} message "Sucessfully updated book ratings."
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse ISBN to a valid number."
 * @apiError (400: Invalid Rating 1 Star) {String} message "Invalid 1 star rating."
 * @apiError (400: Invalid Rating 2 Star) {String} message "Invalid 2 star rating."
 * @apiError (400: Invalid Rating 3 Star) {String} message "Invalid 3 star rating."
 * @apiError (400: Invalid Rating 4 Star) {String} message "Invalid 4 star rating."
 * @apiError (400: Invalid Rating 5 Star) {String} message "Invalid 5 star rating."
 * @apiError (400: Empty Request) {String} message "No parameters recieved."
 * @apiError (404: Not Found) {String} message "Book not found - No book matches the provided ISBN."
 *
 */
router.patch(
    '/update/ratings/:isbn',
    async (request: Request, response: Response) => {
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
        //Check if params are defined and valid

        const rating1Defined = isDefined(request.body.rating_1_star);
        if (rating1Defined && !isNumberProvided(request.body.rating_1_star)) {
            response.status(400).send({
                message: 'Invalid 1 star rating.',
            });
        }
        const rating2Defined = isDefined(request.body.rating_2_star);
        if (rating2Defined && !isNumberProvided(request.body.rating_2_star)) {
            response.status(400).send({
                message: 'Invalid 2 star rating.',
            });
        }
        const rating3Defined = isDefined(request.body.rating_3_star);
        if (rating3Defined && !isNumberProvided(request.body.rating_3_star)) {
            response.status(400).send({
                message: 'Invalid 3 star rating.',
            });
        }
        const rating4Defined = isDefined(request.body.rating_4_star);
        if (rating4Defined && !isNumberProvided(request.body.rating_4_star)) {
            response.status(400).send({
                message: 'Invalid 4 star rating.',
            });
        }
        const rating5Defined = isDefined(request.body.rating_5_Star);
        if (rating5Defined && !isNumberProvided(request.body.rating_5_star)) {
            response.status(400).send({
                message: 'Invalid 5 star rating.',
            });
        }

        if (
            !rating1Defined &&
            !rating2Defined &&
            !rating3Defined &&
            !rating4Defined &&
            !rating5Defined
        ) {
            response.status(400).send({
                message: 'No parameters recieved.',
            });
        }

        try {
            const values = [numericIsbn];
            const selectQuery = `SELECT rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star
                            FROM Books
                            WHERE isbn13 = $1`;
            const selectResult = await pool.query(selectQuery, values);
            if (selectResult.rows.length === 0) {
                return response.status(404).send({
                    message:
                        'Book not found - No book matches the provided ISBN.',
                });
            }
            if (selectResult.rows.length > 1) {
                return response.status(500).send({
                    message: 'Server Error - Multiple books returned for ISBN.',
                });
            }
            const rating1Star = rating1Defined
                ? parseInt(request.body.rating_1_Star, 10)
                : selectResult.rows[0].rating_1_Star;
            const rating2Star = rating2Defined
                ? parseInt(request.body.rating_2_Star, 10)
                : selectResult.rows[0].rating_2_Star;
            const rating3Star = rating3Defined
                ? parseInt(request.body.rating_3_Star, 10)
                : selectResult.rows[0].rating_3_Star;
            const rating4Star = rating4Defined
                ? parseInt(request.body.rating_4_Star, 10)
                : selectResult.rows[0].rating_4_Star;
            const rating5Star = rating5Defined
                ? parseInt(request.body.rating_5_Star, 10)
                : selectResult.rows[0].rating_5_Star;

            const ratingCount =
                rating1Star +
                rating2Star +
                rating3Star +
                rating4Star +
                rating5Star;
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
            values.push(
                ratingAvg,
                ratingCount,
                rating1Star,
                rating2Star,
                rating3Star,
                rating4Star,
                rating5Star
            );

            const theResult = await pool.query(theQuery, values);
            if (theResult.rowCount === 0) {
                /*
                 * ISBN existence confirmed by previous query. Possible error if record is deleted
                 * between query calls - hence duplicate 404.
                 */
                return response.status(404).send({
                    message:
                        'Book not found - No book matches the provided ISBN.',
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
    }
);

export default router;
