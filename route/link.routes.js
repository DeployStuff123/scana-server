import express from 'express';
import { createLink, deleteLink, getAllLinks, getLinkBySlug, updateLink } from '../controller/link.controller.js';
import { verifyToken } from '../middleware/verify.token.js';
const linkRoute = express.Router();

linkRoute.post('/create', verifyToken, createLink);
linkRoute.get('/all',verifyToken, getAllLinks);
linkRoute.get('/details/:slug', getLinkBySlug);
linkRoute.put('/update/:id', verifyToken, updateLink);
linkRoute.delete('/delete/:id', verifyToken, deleteLink);


export default linkRoute;
