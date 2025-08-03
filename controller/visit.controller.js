import linkModel from '../models/link.model.js';
import { v4 as uuidv4 } from 'uuid';


//record anonymous unique visits
export const recordVisit = async (req, res) => {
  try {
    const { slug } = req.params;

    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Invalid slug');
    
    // Step 1: Get or create visitorId
    let visitorId = req.cookies.visitorId;
    if (!visitorId) {
      visitorId = uuidv4();
      res.cookie('visitorId', visitorId, {
        httpOnly: true,
        sameSite: 'Lax',
        // secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
    }

    // Step 2: Use a per-link cookie to check uniqueness
    const visitCookieKey = `visited_${link._id}`;
    const alreadyVisited = req.cookies[visitCookieKey];

    if (!alreadyVisited) {
      // Set cookie to avoid double-counting in the future
      res.cookie(visitCookieKey, true, {
        httpOnly: true,
        sameSite: 'Lax',
        // secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Increment unique visit
      link.visits += 1;
      await link.save();

      // Optional: log anonymous visit in a collection
      // await anonymousVisitModel.create({ link: link._id, visitorId });
    }

    return res.status(200).json({ recorded: !alreadyVisited });
  } catch (error) {
    console.error('Error recording anonymous visit:', error);
    return res.status(500).send('Internal server error');
  }
};


//record all visits
// export const recordVisit = async (req, res) => {
//   try {
//     const { slug } = req.params;
    
//     const link = await linkModel.findOne({ slug });
//     if (!link) return res.status(404).send('Invalid slug');

//     link.visits = link.visits + 1;
//     await link.save();

//     return res.status(200).json({ recorded: true });
//   } catch (error) {
//     console.error('Error recording visit:', error);
//     return res.status(500).send('Internal server error');
//   }
// };
