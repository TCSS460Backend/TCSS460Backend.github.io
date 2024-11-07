import express, { Router } from 'express';
import getBooksByAuthor from './GET/getBooksByAuthor';
import getBooksByISBN from './GET/getBooksByISBN';
import getBooksByRating from './GET/getBooksByRating';
import getBooksByTitle from './GET/getBooksByTitle';
import getBooksByPublicationYear from './GET/getBooksByPublicationYear';

const booksRouter: Router = express.Router();

booksRouter.use(getBooksByAuthor);
booksRouter.use(getBooksByISBN);
booksRouter.use(getBooksByRating);
booksRouter.use(getBooksByTitle);
booksRouter.use(getBooksByPublicationYear);

export { booksRouter };
