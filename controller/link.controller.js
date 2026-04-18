import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import { Parser } from 'json2csv';
import { createError } from '../middleware/error.handler.js';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';
import visitModel from '../models/visit.model.js';
import { escapeRegex } from '../utils/escapeRegex.js';

export const createLink = async (req, res, next) => {
  const { slug, destinationUrl, description, googleLogin, type, isActive, image, buttonName, buttonColor } = req.body;
  try {
    const link = new linkModel({
      slug,
      destinationUrl,
      description,
      googleLogin,
      type,
      buttonName,
      buttonColor,
      isActive,
      image,
      user: req.user.id,
    });
    const existingLink = await linkModel.findOne({ slug });
    if (existingLink) {
      return next(createError(400, { slug: 'Slug already exists' }));
    }
    await link.save();
    res.status(201).send({ message: 'Link created successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAllLinks = async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query; // Default values

  const searchString = escapeRegex(search)

  let query = {};

  // Status Filter
  if (status && status !== 'all') {
    query.isActive = status === 'active';
  }

  // Role-based Query
  if (req.user.role === 'user') {
    query.user = req.user.id;
    if (searchString) {
      query.slug = { $regex: searchString, $options: 'i' };
    }
  }

  // Admin Search (Slug OR Username)
  if (searchString && req.user.role === 'admin') {
    const matchingUsers = await mongoose.model('User').find({
      username: { $regex: searchString, $options: 'i' },
    }).select('_id');

    query.$or = [
      { slug: { $regex: searchString, $options: 'i' } },
      { user: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  // Pagination Logic
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get Total Count for the specific query (for frontend pagination)
  const total = await linkModel.countDocuments(query);

  let linksQuery = linkModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  if (req.user.role === 'admin') {
    linksQuery = linksQuery.populate('user', 'username email _id');
  }

  const links = await linksQuery.exec();

  const linksWithEmailCounts = await Promise.all(
    links.map(async (link) => {
      const emailCount = await emailModel.countDocuments({ link: link._id });
      return {
        ...link.toObject(),
        emailCount,
      };
    })
  );

  res.json({
    links: linksWithEmailCounts,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: parseInt(page),
  });
};

export const getLinkBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { from, to, exportAs } = req.query;

    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Link not found');

    // Build query filter
    const filter = { link: link._id };
    if (from || to) {
      filter.visitedAt = {};
      if (from) filter.visitedAt.$gte = new Date(from);
      if (to) filter.visitedAt.$lte = new Date(to);
    }

    const emails = await emailModel.find(filter).sort({ visitedAt: -1 });

    const user = await userModel.findById(link.user);

    // const visitList = await visitModel.find(filter).sort({ visitedAt: -1 });

    const emailList = emails.map((v) => ({
      _id: v._id,
      email: v.email,
      visitedAt: v.visitedAt,
      followUpSent: v.followUpSent,
      followUpSentAt: v.followUpSentAt,
    }));


    if (exportAs === 'csv') {
      const csvFields = ['email', 'visitedAt'];
      const parser = new Parser({ fields: csvFields });
      const csv = parser.parse(emailList);

      res.header('Content-Type', 'text/csv');
      res.attachment(`${slug}_visits.csv`);
      return res.send(csv);
    }

    return res.json({
      _id: link._id,
      slug: link.slug,
      destinationUrl: link.destinationUrl,
      visits: link.visits,
      googleLogin: link.googleLogin,
      type: link.type,
      isActive: link.isActive,
      image: link.image,
      buttonColor: link.buttonColor,
      buttonName: link.buttonName,
      description: link.description,
      emailList,
      // visitList,
      createdAt: link.createdAt,
      user: user,
      googleLoginNotForced: link.googleLoginNotForced,
    });
  } catch (err) {
    console.error('Error:', err);
    next(err);
  }
};

export const updateLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!link) return res.status(404).send({ message: 'Link not found' });
    res.send({ message: 'Link updated successfully' });
  } catch (error) {
    if (error.code === 11000) {
      return next(createError(400, { slug: 'Slug already exists' }));
    }
    next(error);
  }
};

export const deleteLink = async (req, res, next) => {
  const { id } = req.params;
  try {
    const link = await linkModel.findByIdAndDelete(id);
    if (!link) return res.status(404).send({ message: 'Link not found' });

    // Delete all emails associated with this link
    await emailModel.deleteMany({ link: id });

    //delete all visit
    await visitModel.deleteMany({ link: id });

    res.send({ message: 'Link deleted successfully' });
  } catch (err) {
    next(err);
  }
};
