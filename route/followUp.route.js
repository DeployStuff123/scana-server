import express from 'express';
import { deleteFollowUp, getAllFollowUps, getFollowUpById, requestFollowUp, updateFollowUp } from '../controller/followUp.controller.js';
import { verifyToken } from '../middleware/verify.token.js';

const followUpRouter = express.Router();

followUpRouter.post('/create', verifyToken, requestFollowUp);
followUpRouter.get('/all', verifyToken, getAllFollowUps);
followUpRouter.get('/details/:id', verifyToken, getFollowUpById);
followUpRouter.put('/update/:id', verifyToken, updateFollowUp);
followUpRouter.delete('/delete/:id', verifyToken, deleteFollowUp);

export default followUpRouter;

