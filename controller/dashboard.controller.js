import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import userModel from '../models/user.model.js';

const getDateFilter = (filter) => {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    case '7days':
    case 'week':
      return { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    case '15days':
      return { $gte: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) };
    case '30days':
    case 'month':
      return { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    case 'year':
      return { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) };
    case 'all':
    default:
      return {}; // No date filtering
  }
};


export const getDashboardStats = async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const dateFilter = getDateFilter(filter);

    const linkFilter = { user: req.user.id };
    const emailFilter = {};
    if (dateFilter?.$gte) {
      emailFilter.visitedAt = dateFilter;
    }

    const userLinks = await linkModel.find(linkFilter).select('_id');
    const userLinkIds = userLinks.map(link => link._id);
    emailFilter.link = { $in: userLinkIds };

    // Stats
    const totalLinks = await linkModel.countDocuments(linkFilter);
    const linksWithVisits = await linkModel.find(linkFilter, 'visits updatedAt');

    const totalVisits = linksWithVisits.reduce((sum, link) => {
      const isInRange = dateFilter?.$gte ? new Date(link.updatedAt) >= new Date(dateFilter.$gte) : true;
      return sum + (isInRange ? (link.visits || 0) : 0);
    }, 0);

    const totalEmails = await emailModel.countDocuments(emailFilter);

    // Recent links & emails
    const recentLinks = await linkModel
      .find(linkFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('slug destinationUrl visits createdAt');

    const topLinks = await linkModel
      .find(linkFilter)
      .sort({ visits: -1 })
      .limit(10)
      .select('slug destinationUrl visits');

    const recentEmails = await emailModel
      .find(emailFilter)
      .sort({ visitedAt: -1 })
      .limit(10)
      .populate('link', 'slug')
      .select('email visitedAt');

    res.json({
      filter,
      totalLinks,
      totalVisits,
      totalEmails,
      recentLinks,
      topLinks,
      recentEmails
    });
  } catch (error) {
    console.error('User Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
};


export const getAdminDashboardStats = async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const dateFilter = getDateFilter(filter);

    const emailFilter = {};
    if (dateFilter?.$gte) {
      emailFilter.visitedAt = dateFilter;
    }

    const totalUsers = await userModel.countDocuments();
    const totalLinks = await linkModel.countDocuments();

    const linksWithVisits = await linkModel.find({}, 'visits updatedAt');
    const totalVisits = linksWithVisits.reduce((sum, link) => {
      const isInRange = dateFilter?.$gte ? new Date(link.updatedAt) >= new Date(dateFilter.$gte) : true;
      return sum + (isInRange ? (link.visits || 0) : 0);
    }, 0);

    const totalEmails = await emailModel.countDocuments(emailFilter);

    const recentLinks = await linkModel
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username email')
      .select('slug destinationUrl visits createdAt');

    const topLinks = await linkModel
      .find({})
      .sort({ visits: -1 })
      .limit(10)
      .populate('user', 'username email')
      .select('slug destinationUrl visits');

    const recentEmails = await emailModel
      .find(emailFilter)
      .sort({ visitedAt: -1 })
      .limit(10)
      .populate('link', 'slug')
      .select('email visitedAt');

    res.json({
      filter,
      totalUsers,
      totalLinks,
      totalVisits,
      totalEmails,
      recentLinks,
      topLinks,
      recentEmails
    });
  } catch (error) {
    console.error('Admin Dashboard Stats Error:', error);
    res.status(500).json({ error: 'Error fetching admin dashboard statistics' });
  }
};
