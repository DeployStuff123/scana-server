import linkModel from '../models/link.model.js';
import visitModel from '../models/visit.model.js';

export const recordVisit = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Invalid slug');

    link.visits = link.visits + 1;
    await link.save();

    return res.status(200).json({ recorded: true });
  } catch (error) {
    console.error('Error recording visit:', error);
    return res.status(500).send('Internal server error');
  }
};

export const getVisitsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).json({ error: 'Invalid slug' });

    const visits = await visitModel
      .find({ link: link._id })
      .sort({ visitedAt: -1 });

    return res.json({
      totalVisits: link.visits,
      visits: visits,
    });
  } catch (error) {
    console.error('Error getting visits:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
