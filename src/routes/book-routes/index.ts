import express, { Router } from 'express';
import getBooksByAuthor from './GET/getBooksByAuthor';
import getBooksByISBN from './GET/getBooksByISBN';
import getBooksByRating from './GET/getBooksByRating';

const booksRouter: Router = express.Router();

booksRouter.use(getBooksByAuthor);
booksRouter.use(getBooksByISBN);
booksRouter.use(getBooksByRating);

export { booksRouter };
