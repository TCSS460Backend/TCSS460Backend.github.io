import express, { Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';

const router: Router = express.Router();

const isValidISBN = validationFunctions.isValidISBN;
const isValidPublicationYear = validationFunctions.isValidPublicationYear;
const isValidImageUrl = validationFunctions.isValidImageUrl;
const isDefined = validationFunctions.isDefined;
const isStringProvided = validationFunctions.isStringProvided;
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {patch} /books/update/:isbn Request to alter a book's data by ISBN
 *
 * @apiDescription Request to altar a book's data using its ISBN-13 number. Does not cover rating
 * updates - see (Patch)Request to alter a book's ratings by ISBN. Must recive at least one field
 * to update, else responds with a 400 error.
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
 * @apiBody {String} [image_url] An image of the book
 * @apiBody {String} [image_small_url] A smaller image of the book
 *
 * @apiSuccess {String} message 'Book Successfully Updated.'
 *
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse ISBN to a valid number."
 * @apiError (400: Invalid authors) {String} message "Invalid author(s)."
 * @apiError (400: Invalid publication year) {String} message "Invalid publication year."
 * @apiError (400: Invalid original title) {String} message "Invalid original title."
 * @apiError (400: Invalid title) {String} message "Invalid title."
 * @apiError (400: Invalid image url) {String} message "Invalid image url."
 * @apiError (400: Invalid small image url) {String} message "Invalid small image url."
 * @apiError (400: Empty Request) {String} message "No parameters recieved."
 * @apiError (404: Not Found) {String} message "Book not found - No book matches the provided ISBN."
 *
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
            message: 'Invalid author(s).',
        });
    }
    const publishedDefined = isDefined(request.body.publication_year);
    if (
        publishedDefined &&
        !isValidPublicationYear(request.body.publication_year)
    ) {
        response.status(400).send({
            message: 'Invalid publication year.',
        });
    }
    const originalTitleDefined = isDefined(request.body.original_title);
    if (
        originalTitleDefined &&
        !isStringProvided(request.body.original_title) &&
        !isNumberProvided(request.body.original_title)
    ) {
        response.status(400).send({
            message: 'Invalid original title.',
        });
    }
    const titleDefined = isDefined(request.body.title);
    if (
        titleDefined &&
        !isStringProvided(request.body.title) &&
        !isNumberProvided(request.body.title)
    ) {
        response.status(400).send({
            message: 'Invalid title.',
        });
    }
    const imageDefined = isDefined(request.body.image_url);
    if (imageDefined && !isValidImageUrl(request.body.image_url)) {
        response.status(400).send({
            message: 'Invalid image url.',
        });
    }
    const smallImageDefined = isDefined(request.body.image_small_url);
    if (smallImageDefined && !isValidImageUrl(request.body.image_small_url)) {
        response.status(400).send({
            message: 'Invalid small image url.',
        });
    }
    if (
        !authorDefined &&
        !publishedDefined &&
        !originalTitleDefined &&
        !titleDefined &&
        !imageDefined &&
        !smallImageDefined
    ) {
        response.status(400).send({
            message: 'No parameters recieved.',
        });
    }

    try {
        let theQuery = 'UPDATE Books SET ';
        const values = [numericIsbn];
        const setClauses = [];

        //At least one of these is guaranteed to be true
        if (authorDefined) {
            setClauses.push(`authors = $${values.length + 1}`);
            values.push(request.body.author);
        }
        if (publishedDefined) {
            setClauses.push(`publication_year = $${values.length + 1}`);
            values.push(request.body.publication_year);
        }
        if (originalTitleDefined) {
            setClauses.push(`original_title = $${values.length + 1}`);
            values.push(request.body.original_title);
        }
        if (titleDefined) {
            setClauses.push(`title = $${values.length + 1}`);
            values.push(request.body.title);
        }
        if (imageDefined) {
            setClauses.push(`image_url = $${values.length + 1}`);
            values.push(request.body.image_url);
        }
        if (smallImageDefined) {
            setClauses.push(`image_small_url = $${values.length + 1}`);
            values.push(request.body.image_small_url);
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
        response.status(200).send({
            message: 'Book Successfully Updated.',
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
