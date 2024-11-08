import express, { Request, Response, Router } from 'express';
import { pool } from '../../../core/utilities';
import { validationFunctions } from '../../../core/utilities';
import { BOOK_MESSAGES } from '../../../core/constants/messages'

const router: Router = express.Router();
const { isValidISBN } = validationFunctions;

/**
 * @api {delete} /books/isbn/:isbn Request to delete a book by ISBN
 * 
 * @apiDescription Request to delete a book entry using its ISBN-13 number
 * 
 * @apiName DeleteBookByISBN
 * @apiGroup Books
 * 
 * @apiParam {String} isbn A 13-digit ISBN number
 * 
 * @apiSuccess {Object} message Success message confirming deletion
 * @apiSuccess {String} message.message "Book successfully deleted"
 * @apiSuccess {Object} message.book The deleted book's data
 * 
 * @apiError (400: Invalid ISBN) {String} message "Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string."
 * @apiError (400: Parse Error) {String} message "Invalid ISBN format - Unable to parse ISBN to a valid number."
 * @apiError (404: Not Found) {String} message "Book not found - No book matches the provided ISBN."
 * @apiError (503: Database Error) {String} message "Service Unavailable - Unable to connect to the database make sure the port is correct."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while deleting the book."
 */
router.delete('/isbn/:isbn', async (request: Request, response: Response) => {
    let { isbn } = request.params;
    isbn = isbn.trim();

    // Validate ISBN format
    if (!isValidISBN(isbn)) {
        return response.status(400).send({
            message: BOOK_MESSAGES.ERRORS.INVALID_ISBN
        });
    }

    const numericIsbn = parseInt(isbn, 10);
    if (isNaN(numericIsbn)) {
        return response.status(400).send({
            message: BOOK_MESSAGES.ERRORS.INVALID_ISBN_PARSE
        });
    }

    try {
        // First check if the book exists
        const checkQuery = 'SELECT * FROM Books WHERE isbn13 = $1';
        const checkResult = await pool.query(checkQuery, [numericIsbn]);

        if (checkResult.rows.length === 0) {
            return response.status(404).send({
                message: BOOK_MESSAGES.ERRORS.BOOK_NOT_FOUND
            });
        }

        // Store the book data before deleation
        const bookToDelete = checkResult.rows[0];

        // Delete the book
        const deleteQuery = 'DELETE FROM Books WHERE isbn13 = $1';
        await pool.query(deleteQuery, [numericIsbn]);

        response.status(200).send({
            message: BOOK_MESSAGES.SUCCESS.DELETE,
            book: bookToDelete
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            response.status(503).send({
                message: BOOK_MESSAGES.ERRORS.DATABASE_CONNECTION
            });
        } else {
            response.status(500).send({
                message: BOOK_MESSAGES.ERRORS.INTERNAL_SERVER
            });
        }
    }
});

export default router;