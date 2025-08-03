/* eslint-disable no-undef */
import cron from 'node-cron';
import followupModel from '../models/followup.model.js';
import userModel from '../models/user.model.js';
import emailModel from '../models/email.model.js';
import { sendFollowupEmail } from '../utils/emailSend.js';

//run every 10 minutes
// '*/10 * * * *'

cron.schedule('* * * * *', async () => {
  const now = new Date();
  // console.log('Running follow-up cron...');

  const followUps = await followupModel.find({ approved: true, enabled: true });

  for (const followUp of followUps) {
    const emails = await emailModel.find({ link: followUp.link });
    const user = await userModel.findById(followUp.user);

    for (const emailEntry of emails) {
      // const timePassedInHours = (now - new Date(emailEntry.visitedAt)) / 3600000; // hours
      const timePassedInMinutes = (now - new Date(emailEntry.visitedAt)) / 60000; // minutes

      if (
        (followUp.delayInMinutes === 0 || timePassedInMinutes >= followUp.delayInMinutes) &&
        !emailEntry.followUpSent
      ) {
        await sendFollowupEmail(user.username, emailEntry.email, followUp.subject, followUp.message, followUp.img, followUp.destinationUrl);

        emailEntry.followUpSent = true;
        await emailEntry.save();
        console.log(`Sent follow-up to ${emailEntry.email}`);
      }
    }
  }
});
