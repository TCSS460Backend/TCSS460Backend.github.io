import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;
const isValidPublicationYear = validationFunctions.isValidPublicationYear;
const isValidImageUrl = validationFunctions.isValidImageUrl;

/**
 * @api {post} /books/new Request to create a book entry
 *
 * @apiDescription Request to insert a book with isbn13, authors, publication_year, original_title, title, image_url, and
 * image_small_url fields. Rating fields (rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star) are optional
 * parameters, if not provided or invalid values are provided will default to 0. Valid values consist of ratings >= 0. Note that
 * a default value will be used in place of an error if an invalid value is provided.
 *
 * @apiName PostNewBook
 * @apiGroup Books
 *
 * @apiBody {String} isbn13 A 13-digit ISBN number
 * @apiBody {String} authors The names of the book's author(s)
 * @apiBody {Number} publication_year A valid year of publication (0 C.E. to present day + 5 years)
 * @apiBody {String} title The book's title
 * @apiBody {Number} [rating_1_star=0] The count of 1 star ratings
 * @apiBody {Number} [rating_2_star=0] The count of 2 star ratings
 * @apiBody {Number} [rating_3_star=0] The count of 3 star ratings
 * @apiBody {Number} [rating_4_star=0] The count of 4 star ratings
 * @apiBody {Number} [rating_5_star=0] The count of 5 star ratings
 * @apiBody {String} image_url An image of the book
 * @apiBody {String} image_small_url A smaller image of the book
 *
 * @apiSuccess (Success 201) {String} message "New book record successfully created."
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing isbn13  - isbn13 must be a 13 digit isbn number"
 * @apiError (400: Invalid Author) {String} message "Invalid or missing author(s)  - authors is a text field, check parameter type. Also consider length."
 * @apiError (400: Invalid Publication Year) {String} message "Invalid or missing publication year  - publication years must be in C.E. and no more than 5 years in the future"
 * @apiError (400: Invalid Title) {String} message "Invalid or missing title  - title is a text field, check parameter type. Also consider length."
 * @apiError (400: Invalid ImageURL) {String} message "Invalid or missing imageURL  - must be a url."
 * @apiError (400: Invalid Small ImageURL) {String} message "Invalid or missing small imageURL  - must be a url."
 * @apiError (400: Book Not Created) {String} message "Book could not be created - Verify ISBN is not already in database."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse isbn13 to a valid number."
 * @apiError (400: Parse Error) {String} message "Invalid Publication Year format - Unable to parse publication_year to a valid number."
 */
router.post(
    '/new',
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidISBN(request.body.isbn13)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing isbn13  - isbn13 must be a 13 digit isbn number',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.authors)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing author(s)  - authors is a text field, check parameter type. Also consider length.',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidPublicationYear(request.body.publication_year)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing publication year  - publication years must be in C.E. and no more than 5 years in the future',
            }); //5 years in the future can be seen in isValidPublicationYear() documentation, exists for planned publishing sake
            return;
        }
    },
    /*
     * Original Title should be ignored. Code artifact left for possible future use
     */
    // (request: Request, response: Response, next: NextFunction) => {
    //     if (isStringProvided(request.body.original_title)) {
    //         next();
    //         return;
    //     } else {
    //         response.status(400).send({
    //             message:
    //                 'Invalid or missing original_title  - please refer to documentation',
    //         });
    //         return;
    //     }
    // },
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.title)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing title  - title is a text field, check parameter type. Also consider length.',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidImageUrl(request.body.image_url)) {
            next();
            return;
        } else {
            response.status(400).send({
                message: 'Invalid or missing imageURL  - must be a url.',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidImageUrl(request.body.image_small_url)) {
            next();
            return;
        } else {
            response.status(400).send({
                message: 'Invalid or missing small imageURL  - must be a url.',
            });
            return;
        }
    },

    async (request: Request, response: Response) => {
        try {
            //Assigns default values of 0 to ratings if invalid or unprovided
            const rating1Star = isNumberProvided(request.body.rating_1_star)
                ? parseInt(request.body.rating_1_star, 10)
                : 0;
            console.log('made it here');
            const rating2Star = isNumberProvided(request.body.rating_2_star)
                ? parseInt(request.body.rating_2_star, 10)
                : 0;
            const rating3Star = isNumberProvided(request.body.rating_3_star)
                ? parseInt(request.body.rating_3_star, 10)
                : 0;
            const rating4Star = isNumberProvided(request.body.rating_4_star)
                ? parseInt(request.body.rating_4_star, 10)
                : 0;
            const rating5Star = isNumberProvided(request.body.rating_5_star)
                ? parseInt(request.body.rating_5_star, 10)
                : 0;
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
            console.log('made it here2');
            const numericIsbn = parseInt(request.body.isbn13, 10);
            if (isNaN(numericIsbn)) {
                return response.status(400).send({
                    message:
                        'Invalid ISBN format - Unable to parse isbn13 to a valid number.',
                });
            }
            const numericPublicationYear = parseInt(
                request.body.publication_year,
                10
            );
            if (isNaN(numericPublicationYear)) {
                return response.status(400).send({
                    message:
                        'Invalid Publication Year format - Unable to parse publication_year to a valid number.',
                });
            }

            const originalTitle = 'originalTitleField'; // Artifact left for future code changes

            const theQuery = `INSERT INTO Books (isbn13, authors, publication_year, original_title, title, rating_avg, rating_count,
                    rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url, image_small_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
            const theValues = [
                numericIsbn,
                request.body.authors,
                numericPublicationYear,
                originalTitle,
                request.body.title,
                ratingAvg,
                ratingCount,
                rating1Star,
                rating2Star,
                rating3Star,
                rating4Star,
                rating5Star,
                request.body.image_url,
                request.body.image_small_url,
            ];
            console.log('made it here3');
            const theResult = await pool.query(theQuery, theValues);
            console.log('made it here4');

            if (theResult.rowCount === 0) {
                return response.status(400).send({
                    message:
                        'Book could not be created - Verify ISBN is not already in database.',
                });
            }
            if (theResult.rowCount > 1) {
                return response.status(500).send({
                    message:
                        'Server error - Multiple records created from a single insert.',
                });
            }

            response.status(201).send({
                message: 'New book record successfully created.',
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
                        'Internal Server Error - An unexpected error occurred while inserting the book data.',
                });
            }
        }
    }
);

export default router;
