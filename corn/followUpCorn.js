// crons/followup.cron.js
import cron from 'node-cron';
import { sendFollowupEmail } from '../utils/emailSend.js';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import emailModel from '../models/email.model.js';

cron.schedule('* * * * *', async () => {
  const now = new Date();
  const currentHour = now.getHours(); // 0-23
  const currentDay = now.getDay(); // 0 = Sunday
  const currentDate = now.getDate(); // 1-31

  // console.log(`[${new Date().toLocaleTimeString()}] 🔄 Follow-up cron job running`);

  const followUps = await followupModel.find({ approved: true, enabled: true });

  for (const followUp of followUps) {

    const user = await userModel.findById(followUp.user);

    const emails = await emailModel.find({
      link: followUp.link,
      followUpSent: { $ne: true },
    });

    if (followUp.followUpType === 'casual') {
      for (const emailEntry of emails) {
        const timePassedInMinutes = (now - new Date(emailEntry.visitedAt)) / 60000;
        if ((followUp.delayInMinutes === 0 || timePassedInMinutes >= followUp.delayInMinutes) && !emailEntry.followUpSent) {
          await sendFollowupEmail(
            user.username,
            emailEntry.email,
            followUp.subject,
            followUp.message,
            followUp.attachment.fileType === 'image' ? followUp.attachment.imageUrl : followUp.attachment.pdfUrl,
            followUp.destinationUrl
          );
          emailEntry.followUpSent = true;
          emailEntry.followUpSentAt = new Date();
          await emailEntry.save();
          console.log(`✅ Casual follow-up sent to ${emailEntry.email}`);
        }
      }
    }

    if (followUp.followUpType === 'scheduled') {
      const isScheduledTime =
        followUp.sendHour === currentHour &&
        (followUp.scheduleType === 'daily' ||
          (followUp.scheduleType === 'weekly' && currentDay === followUp.scheduleDay) ||
          (followUp.scheduleType === 'monthly' && currentDate === followUp.scheduleDate));
      if (!isScheduledTime) continue;

      for (const emailEntry of emails) {
        if (!emailEntry.followUpSent) {
          await sendFollowupEmail(
            user.username,
            emailEntry.email,
            followUp.subject,
            followUp.message,
            followUp.attachment.fileType === 'image' ? followUp.attachment.imageUrl : followUp.attachment.pdfUrl,
            followUp.destinationUrl
          );
          emailEntry.followUpSent = true;
          emailEntry.followUpSentAt = new Date();
          await emailEntry.save();
          console.log(`📧 Scheduled follow-up sent to ${emailEntry.email}`);
        }
      }
    }
  }
});
