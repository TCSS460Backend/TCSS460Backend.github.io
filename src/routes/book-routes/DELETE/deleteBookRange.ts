import express, { Request, Response, Router } from 'express';
import { pool } from '../../../core/utilities';
import { validationFunctions } from '../../../core/utilities';
import { BOOK_MESSAGES } from '../../../core/constants/messages'

const router: Router = express.Router();
const { isValidPublicationYear, isDefined } = validationFunctions;

/**
 * @api {delete} /books/range Request to delete a range of books
 * 
 * @apiDescription Request to delete multiple books based on a publication year range
 * 
 * @apiName DeleteBookRange
 * @apiGroup Books
 * 
 * @apiBody {Number} startYear Starting year of the range (inclusive)
 * @apiBody {Number} endYear Ending year of the range (inclusive)
 * 
 * @apiSuccess {Object} message Success message confirming deletion
 * @apiSuccess {String} message.message "Books successfully deleted"
 * @apiSuccess {Number} message.count Number of books deleted
 * @apiSuccess {Object[]} message.books Array of deleted book data
 * 
 * @apiError (400: Invalid Range) {String} message "Invalid year range - both startYear and endYear must be provided"
 * @apiError (400: Invalid Year) {String} message "Invalid year format - years must be valid publication years"
 * @apiError (400: Invalid Range) {String} message "Invalid year range - startYear must be less than or equal to endYear"
 * @apiError (404: Not Found) {String} message "No books found in the specified year range"
 * @apiError (503: Database Error) {String} message "Service Unavailable - Unable to connect to the database make sure the port is correct."
 * @apiError (500: Server Error) {String} message "Internal Server Error - An unexpected error occurred while deleting the books."
 */
router.delete('/range', async (request: Request, response: Response) => {
    const { startYear, endYear } = request.body;

    // Check if both years are provided
    if (!isDefined(startYear) || !isDefined(endYear)) {
        return response.status(400).send({
            message: BOOK_MESSAGES.ERRORS.MISSING_YEAR_RANGE
        });
    }

    // Make sure start year and end year are different
    if (!isValidPublicationYear(startYear) || !isValidPublicationYear(endYear)) {
        return response.status(400).send({
            message: BOOK_MESSAGES.ERRORS.INVALID_YEAR_FORMAT
        });
    }

    // Check year range
    if (Number(startYear) > Number(endYear)) {
        return response.status(400).send({
            message: BOOK_MESSAGES.ERRORS.INVALID_YEAR_RANGE
        });
    }

    try {
        // First get the books to be deleted
        const selectQuery = `
            SELECT * FROM Books 
            WHERE publication_year BETWEEN $1 AND $2
            ORDER BY publication_year`;
        const selectResult = await pool.query(selectQuery, [startYear, endYear]);

        if (selectResult.rows.length === 0) {
            return response.status(404).send({
                message: BOOK_MESSAGES.ERRORS.BOOKS_NOT_FOUND_IN_RANGE
            });
        }

        // Store the books
        const booksToDelete = selectResult.rows;

        // Delete the books
        const deleteQuery = `
            DELETE FROM Books 
            WHERE publication_year BETWEEN $1 AND $2`;
        await pool.query(deleteQuery, [startYear, endYear]);

        response.status(200).send({
            message: BOOK_MESSAGES.SUCCESS.DELETE_RANGE,
            count: booksToDelete.length,
            books: booksToDelete
        });
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            response.status(503).send({
                message: BOOK_MESSAGES.ERRORS.DATABASE_CONNECTION
            });
        } else {
            response.status(500).send({
                message: BOOK_MESSAGES.ERRORS.RANGE_DELETE_SERVER_ERROR
            });
        }
    }
});

export default router;