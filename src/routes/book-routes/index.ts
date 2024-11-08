import express, { Router } from 'express';
import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from '../closed/tokenTest';

import getAllBooks from './GET/getAllBooks';
import getBooksByAuthor from './GET/getBooksByAuthor';
import getBooksByISBN from './GET/getBooksByISBN';
import getBooksByRating from './GET/getBooksByRating';
import getBooksByTitle from './GET/getBooksByTitle';
import getBooksByPublicationYear from './GET/getBooksByPublicationYear';
import patchRate from './PATCH/patchRate';
import patchUpdateBook from './PATCH/patchUpdateBook';
import patchUpdateRatings from './PATCH/patchUpdateRating';
import postNewBook from './POST/postNewBook';
import deleteBookByISB from './DELETE/deleteBookByISBN';
import deleteBookRange from './DELETE/deleteBookRange';

const booksRouter: Router = express.Router();

booksRouter.use(
    checkToken,
    tokenTestRouter,
    getAllBooks,
    getBooksByAuthor,
    getBooksByISBN,
    getBooksByRating,
    getBooksByTitle,
    getBooksByPublicationYear,
    patchRate,
    patchUpdateBook,
    patchUpdateRatings,
    postNewBook,
    deleteBookByISB,
    deleteBookRange
);

export { booksRouter };
