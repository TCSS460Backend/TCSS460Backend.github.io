import express, { Router } from 'express';

import { openRoutes } from './open';
import { authRoutes } from './auth';
import { closedRoutes } from './closed';
import { booksRouter } from './book-routes';

const routes: Router = express.Router();

// Register all route groups
routes.use(openRoutes);
routes.use(authRoutes);
routes.use(closedRoutes);
routes.use('/books', booksRouter);

export { routes };
