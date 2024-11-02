import express, { Router } from 'express';
import getBooksByAuthor from './GET/getBooksByAuthor';
import getBooksByISBN from './GET/getBooksByISBN';

const booksRouter: Router = express.Router();

// Remove the '/books' prefix here since it's already specified in the main routes file
booksRouter.use([
    getBooksByAuthor,
    getBooksByISBN,
    // Add more routes here as needed
]);

export { booksRouter }; // Change to named export to match main routes file
