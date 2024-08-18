import ical from 'ical.js';

function fixIcalFile(icsContent) {

  // START remove X-APPLE-STRUCTURED-LOCATION
  const veventProps = [
    'BEGIN:',

    'CLASS',
    'CREATED',
    'DESCRIPTION',
    'DTSTART',
    'GEO',
    'LAST-MOD',
    'LOCATION',
    'ORGANIZER',
    'PRIORITY',
    'DTSTAMP',
    'SEQ',
    'STATUS',
    'SUMMARY',
    'TRANSP',
    'UID',
    'URL',
    'RECURID',
    'DTEND',
    'DURATION',

    'ATTACH',
    'ATTENDEE',
    'CATEGORIES',
    'COMMENT',

    'CONTACT',
    'EXDATE',
    'EXRULE',
    'RSTATUS',
    'RELATED',

    'RESOURCES',
    'RDATE',
    'RRULE',
    'X-.*',
    'END:'
  ];

  const regex = new RegExp('X-APPLE-STRUCTURED-LOCATION;.+?(?=^' + veventProps.join('|^') + ')', 'smg');
  icsContent = icsContent.replaceAll(regex, '');
  // END remove X-APPLE-STRUCTURED-LOCATION

  return icsContent;
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

