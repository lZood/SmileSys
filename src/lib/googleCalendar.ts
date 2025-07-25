export async function createCalendarEvent(appointment: {
  patient_name: string;
  patient_email: string;
  date: string;
  time: string;
  duration: number;
  treatment_type: string;
  notes?: string;
}, accessToken: string) {
  try {
    const startDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const endDateTime = new Date(startDateTime.getTime() + (appointment.duration * 60000));

    const event = {
      summary: `Cita: ${appointment.treatment_type}`,
      description: `Paciente: ${appointment.patient_name}
${appointment.notes || ''}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Mexico_City',
      },
      attendees: [
        { email: appointment.patient_email },
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create calendar event:', errorData);
      throw new Error('Failed to create calendar event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}
