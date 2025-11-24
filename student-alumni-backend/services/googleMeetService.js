const { google } = require('googleapis');
require('dotenv').config();

class GoogleMeetService {
  constructor() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!clientEmail || !privateKey) {
      // Don't crash the whole server if env vars are missing. Log a warning and disable Meet features.
      console.warn('Google Meet credentials missing: set GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY in .env to enable Meet creation.');
      this.calendar = null;
      return;
    }

    // If the key was stored with escaped newlines (\n), convert them to actual newlines.
    if (!privateKey.startsWith('-----BEGIN')) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }

    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  async createMeeting(title, startTime, endTime) {
    if (!this.calendar) {
      throw new Error('Google Meet client not configured. Missing GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY in environment.');
    }
    try {
      const event = {
        summary: title,
        start: {
          dateTime: startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: `meeting-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      };

      const result = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        resource: event,
      });

      return result.data.hangoutLink;
    } catch (error) {
      console.error('Error creating Google Meet:', error);
      throw error;
    }
  }
}

module.exports = new GoogleMeetService();