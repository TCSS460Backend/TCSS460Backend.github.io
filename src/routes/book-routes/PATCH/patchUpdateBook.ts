import express, { NextFunction, Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isValidPublicationYear = validationFunctions.isValidPublicationYear;
const isValidImageUrl = validationFunctions.isValidImageUrl;
const isDefined = validationFunctions.isDefined;
const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {patch} /books/isbn/:isbn Request to alter a book's data by ISBN
 *
 * @apiDescription Request to altar a book's data using its ISBN-13 number
 *
 * @apiName patchUpdateBook
 * @apiGroup Books
 *
 * @apiParam {String} isbn A 13-digit ISBN number
 *
 * @apiBody {String} [authors] The names of the book's author(s)
 * @apiBody {String} [publication_year] A valid year of publication (0 C.E. to present day + 5 years)
 * @apiBody {String} [original_title] The original title of the book
 * @apiBody {String} [title] The book's title
 * @apiBody {Number} [rating_1_star=0] The count of 1 star ratings
 * @apiBody {Number} [rating_2_star=0] The count of 2 star ratings
 * @apiBody {Number} [rating_3_star=0] The count of 3 star ratings
 * @apiBody {Number} [rating_4_star=0] The count of 4 star ratings
 * @apiBody {Number} [rating_5_star=0] The count of 5 star ratings
 * @apiBody {String} [image_url] An image of the book
 * @apiBody {String} [image_small_url] A smaller image of the book
 *
 *
 *
 *
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
router.patch('/update/:isbn', async (request: Request, response: Response) => {
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
    const authorDefined = isDefined(request.body.authors);
    if (
        authorDefined &&
        !isStringProvided(request.body.authors) &&
        !isNumberProvided(request.body.author)
    ) {
        response.status(400).send({
            message: 'Invalid author',
        });
    }
    const publishedDefined = isDefined(request.body.publication_year);
    if (
        publishedDefined &&
        !isValidPublicationYear(request.body.publication_year)
    ) {
        response.status(400).send({
            message: 'Invalid publication year',
        });
    }
    const originalTitleDefined = isDefined(request.body.original_title);
    if (
        originalTitleDefined &&
        !isStringProvided(request.body.original_title) &&
        !isNumberProvided(request.body.original_title)
    ) {
        response.status(400).send({
            message: 'Invalid original title',
        });
    }
    const titleDefined = isDefined(request.body.title);
    if (
        titleDefined &&
        !isStringProvided(request.body.title) &&
        !isNumberProvided(request.body.title)
    ) {
        response.status(400).send({
            message: 'Invalid title',
        });
    }
    const rating1Defined = isDefined(request.body.rating_1_star);
    if (rating1Defined && !isNumberProvided(request.body.rating_1_star)) {
        response.status(400).send({
            message: 'Invalid 1 star rating',
        });
    }
    const rating2Defined = isDefined(request.body.rating_2_star);
    if (rating2Defined && !isNumberProvided(request.body.rating_2_star)) {
        response.status(400).send({
            message: 'Invalid 2 star rating',
        });
    }
    const rating3Defined = isDefined(request.body.rating_3_star);
    if (rating3Defined && !isNumberProvided(request.body.rating_3_star)) {
        response.status(400).send({
            message: 'Invalid 3 star rating',
        });
    }
    const rating4Defined = isDefined(request.body.rating_4_star);
    if (rating4Defined && !isNumberProvided(request.body.rating_4_star)) {
        response.status(400).send({
            message: 'Invalid 4 star rating',
        });
    }
    const rating5Defined = isDefined(request.body.rating_5_Star);
    if (rating5Defined && !isNumberProvided(request.body.rating_5_star)) {
        response.status(400).send({
            message: 'Invalid 5 star rating',
        });
    }
    const imageDefined = isDefined(request.body.image_url);
    if (imageDefined && !isValidImageUrl(request.body.image_url)) {
        response.status(400).send({
            message: 'Invalid image url',
        });
    }
    const smallImageDefined = isDefined(request.body.image_small_url);
    if (smallImageDefined && !isValidImageUrl(request.body.image_small_url)) {
        response.status(400).send({
            message: 'Invalid small image url',
        });
    }
    if (
        !authorDefined &&
        !publishedDefined &&
        !originalTitleDefined &&
        !titleDefined &&
        !rating1Defined &&
        !rating2Defined &&
        !rating3Defined &&
        !rating4Defined &&
        !rating5Defined &&
        !imageDefined &&
        !smallImageDefined
    ) {
        response.status(400).send({
            message: 'No parameters recieved',
        });
    }

    //TODO if ratings are included, average and total will have to be updated as well

    try {
        /*
            @apiBody {String} [authors] The names of the book's author(s)
 * @apiBody {String} [publication_year] A valid year of publication (0 C.E. to present day + 5 years)
 * @apiBody {String} [original_title] The original title of the book
 * @apiBody {String} [title] The book's title
 * @apiBody {Number} [rating_1_star=0] The count of 1 star ratings
 * @apiBody {Number} [rating_2_star=0] The count of 2 star ratings
 * @apiBody {Number} [rating_3_star=0] The count of 3 star ratings
 * @apiBody {Number} [rating_4_star=0] The count of 4 star ratings
 * @apiBody {Number} [rating_5_star=0] The count of 5 star ratings
 * @apiBody {String} [image_url] An image of the book
 * @apiBody {String} [image_small_url] A smaller image of the book
            */

        const theQuery =
            'UPDATE Books SET column1 = value1, column2 = value2 WHERE isbn13 = $1';
        const values = [numericIsbn];
        //TODO figure out a better way to do this
        const setClauses = [];
        if (authorDefined) {
            setClauses.push(`authors = $${values.length + 1}`);
            values.push(request.body.author);
        }
        if (publishedDefined) {
            setClauses.push(`publication_year = $${values.length + 1}`);
            values.push(request.body.publication_year);
        }

        // Join the set clauses and add the WHERE clause
        theQuery += setClauses.join(', ') + ' WHERE isbn13 = $1';

        const theResult = await pool.query(theQuery, values);

        if (theResult.rows.length === 0) {
            return response.status(404).send({
                message: 'Book not found - No book matches the provided ISBN.',
            });
        }
        if (theResult.rows[0].isbn13 === null) {
            return response.status(500).send({
                message: 'Data error - The book record is missing an ISBN.',
            });
        }
        if (theResult.rows[0].title === null) {
            return response.status(500).send({
                message: 'Data error - The book record is missing a title.',
            });
        }
        response.status(200).send(theResult.rows[0]);
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
