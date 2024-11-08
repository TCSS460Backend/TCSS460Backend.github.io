export const BOOK_MESSAGES = {
    ERRORS: {
        INVALID_ISBN: 'Invalid or missing ISBN - The provided ISBN must be a 13-digit numeric string.',
        INVALID_ISBN_PARSE: 'Invalid ISBN format - Unable to parse ISBN to a valid number.',
        BOOK_NOT_FOUND: 'Book not found - No book matches the provided ISBN.',
        DATABASE_CONNECTION: 'Service Unavailable - Unable to connect to the database make sure the port is correct.',
        INTERNAL_SERVER: 'Internal Server Error - An unexpected error occurred while deleting the book.',

        MISSING_YEAR_RANGE: 'Invalid year range - both startYear and endYear must be provided',
        INVALID_YEAR_FORMAT: 'Invalid year format - years must be valid publication years',
        INVALID_YEAR_RANGE: 'Invalid year range - startYear must be less than or equal to endYear',
        BOOKS_NOT_FOUND_IN_RANGE: 'No books found in the specified year range',
        RANGE_DELETE_SERVER_ERROR: 'Internal Server Error - An unexpected error occurred while deleting the books.'
    },
    SUCCESS: {
        DELETE: 'Book successfully deleted',
        DELETE_RANGE: 'Books successfully deleted',
        CREATE: 'Book successfully created',
        UPDATE: 'Book successfully updated'
    }
} as const;