import express, { Router } from 'express';
import { checkToken } from '../../core/middleware';
import { tokenTestRouter } from '../closed/tokenTest';

import getBooksByAuthor from './GET/getBooksByAuthor';
import getBooksByISBN from './GET/getBooksByISBN';
import getBooksByRating from './GET/getBooksByRating';
import getBooksByTitle from './GET/getBooksByTitle';
import getBooksByPublicationYear from './GET/getBooksByPublicationYear';
import postNewBook from './POST/postNewBook';

const booksRouter: Router = express.Router();

booksRouter.use(
    checkToken,
    tokenTestRouter,
    getBooksByAuthor,
    getBooksByISBN,
    getBooksByRating,
    getBooksByTitle,
    getBooksByPublicationYear,
    postNewBook
);

export { booksRouter };