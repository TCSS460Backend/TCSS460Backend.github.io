import express, { Request, Response, Router } from 'express';
import { pool, validationFunctions } from '../../../core/utilities';
import { mapBookToIBook } from '../../../core/utilities/interfaces';

const router: Router = express.Router();
const isNumberProvided = validationFunctions.isNumberProvided;

/**
 * @api {get} /books/all Request to retrieve books by pagination
 *
 * @apiDescription Request to retrieve all book entries by pagination
 * @apiName GetAllBooksByPagination
 * @apiGroup Books
 *
 * @apiQuery {Number} limit the number of book objects to return. Note that if a value less than 0,
 * a non-numeric value, or no value is provided then default limit of 10 is used instead.
 *
 * @apiQuery {Number} offset the number to offset the lookup of book objects to return. Note that
 * if a value less than 0, a non-numeric value, or no value is provided then default limit of 0
 * is used instead.
 *
 *
 * @apiSuccess {Object[]} books Array of book objects.
 * @apiSuccess {Number} books.isbn13 The book's ISBN-13 number.
 * @apiSuccess {String} books.authors The names of the book's author(s).
 * @apiSuccess {Number} books.publication The publication year of the book.
 * @apiSuccess {String} books.original_title The original title of the book.
 * @apiSuccess {String} books.title The book's title.
 * @apiSuccess {Object} books.ratings Rating information for the book.
 * @apiSuccess {Number} books.ratings.average The average rating of the book.
 * @apiSuccess {Number} books.ratings.count The total count of ratings.
 * @apiSuccess {Number} books.ratings.rating_1 The count of 1-star ratings.
 * @apiSuccess {Number} books.ratings.rating_2 The count of 2-star ratings.
 * @apiSuccess {Number} books.ratings.rating_3 The count of 3-star ratings.
 * @apiSuccess {Number} books.ratings.rating_4 The count of 4-star ratings.
 * @apiSuccess {Number} books.ratings.rating_5 The count of 5-star ratings.
 * @apiSuccess {Object} books.icons Image URLs for the book.
 * @apiSuccess {String} books.icons.large URL for the large image of the book.
 * @apiSuccess {String} books.icons.small URL for the small image of the book.
 *
 * @apiSuccess {Object} pagination metadata results from the paginated query
 * @apiSuccess {number} pagination.totalRecords the most recent count of the total number of entries. May be stale.
 * @apiSuccess {number} pagination.limit the number of book objects returned.
 * @apiSuccess {number} pagination.offset the number used to offset the lookup of book objects.
 * @apiSuccess {number} pagination.nextPage the offset that should be used on a preceeding call to this route.
 *
 */
router.get('/all', async (request: Request, response: Response) => {
    const limit: number =
        isNumberProvided(request.query.limit) && +request.query.limit > 0
            ? +request.query.limit
            : 10;

    const offset: number =
        isNumberProvided(request.query.offset) && +request.query.offset >= 0
            ? +request.query.offset
            : 0;

    try {
        const theQuery = `SELECT * FROM Books
                    ORDER BY title ASC
                    LIMIT $1
                    OFFSET $2`;
        const theValues = [request.query.limit, request.query.offset];
        const { rows } = await pool.query(theQuery, theValues);

        const result = await pool.query(
            'SELECT count(*) AS exact_count FROM Books;'
        );
        const count = result.rows[0].exact_count;

        response.status(200).send({
            books: rows.map(mapBookToIBook),
            pagination: {
                totalRecords: count,
                limit,
                offset,
                nextPage: limit + offset,
            },
        });
    } catch (error) {
        console.error('Error in getBooksByPagination:', error);
        return response.status(500).send({
            message:
                'Internal Server Error - An unexpected error occurred while fetching the books.',
        });
    }
});

export default router;
