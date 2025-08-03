import express from 'express';
import { getEmailsBySlug, makeFollowUpSentFalse, recordEmail, deleteEmails } from '../controller/email.controller.js';

const emailRoute = express.Router();

emailRoute.post('/record/:slug', recordEmail);
emailRoute.get('/all/:slug', getEmailsBySlug);
emailRoute.post('/followup-false', makeFollowUpSentFalse);
emailRoute.post('/delete-emails', deleteEmails);

export default emailRoute;