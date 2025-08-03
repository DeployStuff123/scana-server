import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import { Parser } from 'json2csv';
import { createError } from '../middleware/error.handler.js';
import mongoose from 'mongoose';
import userModel from '../models/user.model.js';

export const createLink = async (req, res, next) => {
  const { slug, destinationUrl,description, googleLogin, type, isActive, image, buttonName, buttonColor } = req.body;
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
  const { search, status } = req.query;
  let query = {};

  if (status) {
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }
  }
  // For regular users, only show their own links
  if (req.user.role === 'user') {
    query.user = req.user.id;

    // If search term is provided, search by slug (within their own links)
    if (search) {
      query.slug = { $regex: search, $options: 'i' };
    }
  }

  // For admins, search by slug OR username
  if (search && req.user.role === 'admin') {
    // First find users that match the username search
    const matchingUsers = await mongoose
      .model('User')
      .find({
        username: { $regex: search, $options: 'i' },
      })
      .select('_id');

    // Create an OR condition to search in slug or user IDs
    query.$or = [
      { slug: { $regex: search, $options: 'i' } },
      { user: { $in: matchingUsers.map((u) => u._id) } },
    ];
  }

  let linksQuery = linkModel.find(query).sort({ createdAt: -1 });

  // Populate user for admin (needed for username display)
  if (req.user.role === 'admin') {
    linksQuery = linksQuery.populate('user', 'username email _id'); // only populate username
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

  res.json(linksWithEmailCounts);
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

    res.send({ message: 'Link deleted successfully' });
  } catch (err) {
    next(err);
  }
};
