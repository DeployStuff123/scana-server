# Follow-Up Email Features

This application now supports two types of follow-up emails:

## 1. Casual Follow-Up (Existing Feature)

**How it works:**
- Sends follow-up emails after a specified delay (in minutes) from when someone visits your link
- Delay can be set from 0 to 1440 minutes (24 hours)
- If delay is 0, emails are sent immediately

**API Usage:**
```json
{
  "link": "linkId",
  "enabled": true,
  "approved": true,
  "subject": "Follow-up Subject",
  "message": "Follow-up message",
  "delayInMinutes": 30,
  "img": "image_url",
  "destinationUrl": "https://example.com",
  "followUpType": "casual"
}
```

## 2. Scheduled Follow-Up (New Feature)

**How it works:**
- Sends follow-up emails at specific times on a schedule
- Supports daily and weekly frequencies
- All emails collected during a period receive the follow-up at the scheduled time

**Examples:**
- **Daily at 8 PM:** All emails from 8 PM day 1 to 8 PM day 2 will receive follow-up at 8 PM on day 2
- **Weekly on Monday at 10 AM:** All emails from Monday 10 AM to next Monday 10 AM will receive follow-up on Monday at 10 AM

**API Usage:**

**Daily Schedule:**
```json
{
  "link": "linkId",
  "enabled": true,
  "approved": true,
  "subject": "Daily Follow-up",
  "message": "Daily follow-up message",
  "img": "image_url",
  "destinationUrl": "https://example.com",
  "followUpType": "scheduled",
  "scheduledTime": "20:00",
  "scheduledFrequency": "daily"
}
```

**Weekly Schedule:**
```json
{
  "link": "linkId",
  "enabled": true,
  "approved": true,
  "subject": "Weekly Follow-up",
  "message": "Weekly follow-up message",
  "img": "image_url",
  "destinationUrl": "https://example.com",
  "followUpType": "scheduled",
  "scheduledTime": "10:00",
  "scheduledFrequency": "weekly",
  "scheduledDayOfWeek": 1
}
```

## Field Descriptions

### Common Fields
- `link`: The link ID this follow-up is associated with
- `enabled`: Whether the follow-up is active
- `approved`: Whether the follow-up has been approved by admin
- `subject`: Email subject line
- `message`: Email message content
- `img`: Image URL to include in the email
- `destinationUrl`: URL to redirect to when email is clicked
- `followUpType`: Either "casual" or "scheduled"

### Casual Follow-Up Fields
- `delayInMinutes`: Delay in minutes before sending follow-up (0-1440)

### Scheduled Follow-Up Fields
- `scheduledTime`: Time in HH:MM format (e.g., "20:00" for 8 PM)
- `scheduledFrequency`: Either "daily" or "weekly"
- `scheduledDayOfWeek`: Day of week (0-6, where 0=Sunday, 1=Monday, etc.) - only for weekly frequency

## How It Works

1. **Email Collection:** When someone visits a link and provides their email, the system records it with the appropriate follow-up settings.

2. **Casual Follow-ups:** The cron job runs every minute and checks if enough time has passed since email collection to send follow-ups.

3. **Scheduled Follow-ups:** The cron job runs every minute and checks if it's the scheduled time to send follow-ups to all collected emails.

4. **Tracking:** The system tracks which emails have received follow-ups to avoid duplicates.

## API Endpoints

- `POST /followup/create` - Create a new follow-up
- `GET /followup/all` - Get all follow-ups for the user
- `GET /followup/details/:id` - Get specific follow-up details
- `PUT /followup/update/:id` - Update a follow-up
- `DELETE /followup/delete/:id` - Delete a follow-up 