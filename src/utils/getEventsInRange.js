import ical from 'ical.js';

function fixIcalFile(icsContent) {
  const allowedProps = 'BEGIN END VERSION PRODID X-WR-CALNAME X-APPLE-CALENDAR-COLOR CREATED DTEND DTSTAMP DTSTART LAST-MODIFIED LOCATION SEQUENCE SUMMARY UID URL X-APPLE-STRUCTURED-LOCATION DESCRIPTION EXDATE RRULE X-APPLE-CREATOR-IDENTITY X-APPLE-CREATOR-TEAM-IDENTITY X-APPLE-MAPKIT-HANDLE TZNAME TZOFFSETFROM TZOFFSETTO RDATE X-LIC-LOCATION ATTENDEE ORGANIZER STATUS'.split(' ')

  // lines must start with a whitespace or with one of the allowed property names
  const lines = icsContent.split('\n')
    .filter(line => line.startsWith(' ') || allowedProps.some(prop => line.startsWith(prop)))
    .join('\n')

  return lines
}

export function getEventsInRange(icsContent, startDate, endDate) {
  icsContent = fixIcalFile(icsContent)
  console.log('icsContent', icsContent)
  // icsContent = icsContent.replaceAll('\n\n', ' '); // remove double newlines

  try {
    const jcalData = ical.parse(icsContent);
    const comp = new ical.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');

    const events = [];

    vevents.forEach(event => {
      const eventComp = new ical.Event(event);

      // Handle recurring events
      if (eventComp.isRecurring()) {
        const iterator = eventComp.iterator();
        let next;

        while ((next = iterator.next())) {
          const occurrence = ical.Time.fromJSDate(new Date(next.toJSDate()));

          if (occurrence.compare(startDate) >= 0 && occurrence.compare(endDate) <= 0) {
            throw new Error('Recurring events are not supported yet');
            // events.push({
            //   nextAsString: next.toString(),
            //   eventCompAsString: eventComp.toString(),
            // });
          }

          if (occurrence.compare(endDate) > 0) {
            break;
          }
        }
      } else {
        const eventStart = eventComp.startDate.toJSDate();
        const eventEnd = eventComp.endDate.toJSDate();

        // Handle single and multi-day events
        if ((eventStart >= startDate && eventStart <= endDate) ||
          (eventEnd >= startDate && eventEnd <= endDate) ||
          (eventStart <= startDate && eventEnd >= endDate)) {
          events.push(eventComp.toString())
        }
      }
    });

    return events;
  } catch (error) {
    console.error("Error processing iCalendar data:", error);
  }
  return [];
};

// const startDate = new Date('2000-08-16'); // example start date
// const endDate = new Date('2024-08-18');   // example end date
// const events = getEventsInRange(iCalendarData, startDate, endDate);

