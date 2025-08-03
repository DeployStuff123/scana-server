import linkModel from '../models/link.model.js';
import emailModel from '../models/email.model.js';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import { sendFollowupEmail } from '../utils/emailSend.js';

export const recordEmail = async (req, res) => {
  try {
    const { slug } = req.params;
    const { email } = req.body;

    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).send('Invalid slug');

    // Check if email already exists for this link
    // const existingEmail = await emailModel.findOne({
    //   link: link._id,
    //   email: email
    // });

    // if (existingEmail) {
    //   return res.status(200).json({
    //     error: 'This email has already been registered for this link'
    //   });
    // }

    // Get follow-up settings for this link
    const followUp = await followupModel.findOne({ link: link._id });
  

    // Record new email
    const emailRecord = new emailModel({
      link: link._id,
      email: email,
    });
    await emailRecord.save();

    // Handle immediate casual follow-up (existing logic)
    if (followUp && followUp.followUpType === 'casual') {
      const user = await userModel.findOne({ _id: followUp.user });
      if (followUp.delayInMinutes === 0) {
        if (followUp.enabled && followUp.approved && user.isBlocked === false) {
          const emails = await emailModel.find({ link: link._id });
          for (const emailEntry of emails) {
            if (!emailEntry.followUpSent) {
              await sendFollowupEmail(
                user.username,
                emailEntry.email,
                followUp.subject,
                followUp.message,
                followUp.attachment.fileType === 'image' ? followUp.attachment.imageUrl :followUp.attachment.pdfUrl,
                followUp.destinationUrl,
              );
              emailEntry.followUpSent = true;
              emailEntry.followUpSentAt = new Date();
              await emailEntry.save();
            }
          }
        }
      }
    }

    return res.status(201).send('Email recorded');
  } catch (error) {
    return res.status(500).send(error.message);
  }
};

//make followUpSent  false for selected emails
export const makeFollowUpSentFalse = async (req, res) => {
  const { emailIds } = req.body;

  await emailModel.updateMany(
    { _id: { $in: emailIds } },
    { followUpSent: false }
  );
  return res.status(200).send({ message: 'Follow-up sent status updated' });
};

//selected emails delete
export const deleteEmails = async (req, res) => {
  const { emailIds } = req.body;
  await emailModel.deleteMany({ _id: { $in: emailIds } });
  return res.status(200).send({ message: 'Emails deleted' });
};

export const getEmailsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await linkModel.findOne({ slug });
    if (!link) return res.status(404).json({ error: 'Invalid slug' });

    const emails = await emailModel
      .find({ link: link._id })
      .sort({ visitedAt: -1 });

    return res.json(emails);
  } catch (error) {
    console.error('Error getting emails:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
