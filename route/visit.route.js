import express from 'express';
import { getVisitbyLink, recordVisit, deleteVisits } from '../controller/visit.controller.js';

const visitRoute = express.Router();

visitRoute.post('/record/:slug', recordVisit);

visitRoute.get('/get/:linkId', getVisitbyLink);

visitRoute.post('/delete', deleteVisits);

export default visitRoute;
