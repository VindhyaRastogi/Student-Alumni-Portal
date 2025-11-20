const { google } = require('googleapis');

/**
 * Create a Google Calendar event with a Meet link using a service account.
 * Requires environment variables:
 * - GOOGLE_CLIENT_EMAIL
 * - GOOGLE_PRIVATE_KEY (newlines escaped as \n in env)
 * - GOOGLE_CALENDAR_ID (optional, defaults to 'primary')
 *
 * Returns { meetLink, eventId, htmlLink } on success, or throws.
 */
async function createMeetEvent({ summary, start, end, attendees = [], description = '', requestId = '' }) {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  if (!clientEmail || !privateKey) {
    throw new Error('Google service account credentials not configured (GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY)');
  }

  // fix escaped newlines if the key was set in env with \n sequences
  const key = privateKey.replace(/\\n/g, '\n');

  const jwtClient = new google.auth.JWT(
    clientEmail,
    null,
    key,
    ['https://www.googleapis.com/auth/calendar']
  );

  await jwtClient.authorize();
  const calendar = google.calendar({ version: 'v3', auth: jwtClient });

  const event = {
    summary: summary || 'Meeting',
    description: description || '',
    start: { dateTime: new Date(start).toISOString() },
    end: { dateTime: new Date(end).toISOString() },
    attendees: attendees.map((e) => ({ email: e })),
    conferenceData: {
      createRequest: {
        requestId: requestId || `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' }
      }
    }
  };

  const res = await calendar.events.insert({
    calendarId,
    resource: event,
    conferenceDataVersion: 1
  });

  const data = res && res.data ? res.data : {};
  // hangoutLink is the Meet link for classic Meet integration
  const meetLink = data.hangoutLink || (data.conferenceData && data.conferenceData.entryPoints && data.conferenceData.entryPoints.find(e => e.entryPointType === 'video')?.uri) || null;
  const eventId = data.id || null;
  const htmlLink = data.htmlLink || null;

  return { meetLink, eventId, htmlLink };
}

module.exports = { createMeetEvent };