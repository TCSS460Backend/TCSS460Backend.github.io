import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;
const isValidPublicationYear = validationFunctions.isValidPublicationYear;
const isValidImageUrl = validationFunctions.isValidImageUrl;

/*
 * Helper function, checks if either no ratings are provided or all are and valid.
 * If only some ratings are provided or ratings are invalid responds with a 400
 */
function areRatingsProvided(request: Request, response: Response): boolean {
    if (
        isNumberProvided(request.body.rating_1_star) ||
        isNumberProvided(request.body.rating_2_star) ||
        isNumberProvided(request.body.rating_3_star) ||
        isNumberProvided(request.body.rating_4_star) ||
        isNumberProvided(request.body.rating_5_star)
    ) {
        if (
            isNumberProvided(request.body.rating_1_star) &&
            isNumberProvided(request.body.rating_2_star) &&
            isNumberProvided(request.body.rating_3_star) &&
            isNumberProvided(request.body.rating_4_star) &&
            isNumberProvided(request.body.rating_5_star) &&
            parseInt(request.body.rating_1_star, 10) >= 0 &&
            parseInt(request.body.rating_2_star, 10) >= 0 &&
            parseInt(request.body.rating_3_star, 10) >= 0 &&
            parseInt(request.body.rating_4_star, 10) >= 0 &&
            parseInt(request.body.rating_5_star, 10)
        ) {
            return true; //All ratings are provided and valid
        } else {
            //Either not all ratings are passed, some ratings are invalid, or a mix thereof
            response.status(400).send({
                message:
                    'Ratings either incomplete or invalid - either send no ratings to resort to default values or send all ratings with valid inputs.',
            });
            return;
        }
    }
    return false; //No ratings passed
}

/*
 * on {post} /books/new/
 * body = isbn13 BIGINT,
        authors TEXT,
        publication_year INT,
        original_title TEXT,
        title TEXT,
        image_url TEXT,
        image_small_url TEXT
 */

/**
 * @api {post} /books/new Request to create a book entry
 *
 * @apiDescription Request to insert a book with isbn13, authors, publication_year, original_title, title, image_url, and
 * image_small_url fields. Rating fields (rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star) are optional
 * parameters, but either none must be present or all must be present (including 0 values) and consist of valid values (>=0).
 *
 * @apiName PostNewBook
 * @apiGroup Books
 *
 * @apiBody {String} isbn13 A 13-digit ISBN number
 * @apiBody {String} authors The names of the book's author(s)
 * @apiBody {String} publication_year A valid year of publication (0 C.E. to present day + 5 years)
 * @apiBody {String} original_title The original title of the book
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
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing isbn13  - please refer to documentation"
 * @apiError (400: Invalid Author) {String} message "Invalid or missing author(s)  - please refer to documentation"
 * @apiError (400: Invalid Publication Year) {String} message "Invalid or missing publication year  - publication years must be in C.E. and no more than 5 years in the future"
 * @apiError (400: Invalid Original Title) {String} message "Invalid or missing original_title  - please refer to documentation"
 * @apiError (400: Invalid Title) {String} message "Invalid or missing title  - please refer to documentation"
 * @apiError (400: Invalid ImageURL) {String} message "Invalid or missing imageURL  - please refer to documentation"
 * @apiError (400: Invalid Small ImageURL) {String} message "Invalid or missing small imageURL  - please refer to documentation"
 * @apiError (400: Book Not Created) {String} message "Book could not be created - Verify ISBN is not already in database."
 * @apiError (400: Invalid Ratings) {String} message "Ratings either incomplete or invalid - either send no ratings to resort to default values or send all ratings with valid inputs."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse isbn13 to a valid number."
 * @apiError (400: Parse Error) {String} message "Invalid Publication Year format - Unable to parse publication_year to a valid number."
 */
router.post(
    '/books/new',
    (request: Request, response: Response, next: NextFunction) => {
        if (isValidISBN(request.body.isbn13)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing isbn13  - please refer to documentation',
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
                    'Invalid or missing author(s)  - please refer to documentation',
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
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.original_title)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing original_title  - please refer to documentation',
            });
            return;
        }
    },
    (request: Request, response: Response, next: NextFunction) => {
        if (isStringProvided(request.body.title)) {
            next();
            return;
        } else {
            response.status(400).send({
                message:
                    'Invalid or missing title  - please refer to documentation',
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
                message:
                    'Invalid or missing imageURL  - please refer to documentation',
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
                message:
                    'Invalid or missing small imageURL  - please refer to documentation',
            });
            return;
        }
    },

    async (request: Request, response: Response) => {
        try {
            //Assigns default values of 0 to ratings, overrides them iff there are valid provided ratings
            let ratingAvg: number = 0.0;
            let ratingCount: number = 0;
            let rating1Star: number = 0;
            let rating2Star: number = 0;
            let rating3Star: number = 0;
            let rating4Star: number = 0;
            let rating5Star: number = 0;
            if (areRatingsProvided(request, response)) {
                rating1Star = parseInt(request.body.rating_1_star, 10);
                rating2Star = parseInt(request.body.rating_2_star, 10);
                rating3Star = parseInt(request.body.rating_3_star, 10);
                rating4Star = parseInt(request.body.rating_4_star, 10);
                rating5Star = parseInt(request.body.rating_5_star, 10);
                ratingCount =
                    rating1Star +
                    rating2Star +
                    rating3Star +
                    rating4Star +
                    rating5Star;
                ratingAvg =
                    (rating1Star +
                        2 * rating2Star +
                        3 * rating3Star +
                        4 * rating4Star +
                        5 * rating5Star) /
                    ratingCount;
            }

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

            const theQuery = `INSERT INTO Books (isbn13, authors, publication_year, original_title, title, rating_avg, rating_count,
                    rating_1_star, rating_2_star, rating_3_star, rating_4_star, rating_5_star, image_url, image_small_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`;
            const theValues = [
                numericIsbn,
                request.body.authors,
                numericPublicationYear,
                request.body.original_title,
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
            const theResult = await pool.query(theQuery, theValues);

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
