import ical from 'ical.js';

// https://weather-in-calendar.com/cal/weather-cal.php?city=Potsdam&units=metric&temperature=low-high

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

function getOccurenceAsOwnEvent(eventComp, occurrenceDate) {
  // this function clones the event
  try {
    const originalEvent = eventComp.component

    // Create a new VEVENT component
    const newEvent = new ical.Component('vevent');

    // Iterate over all properties of the original event
    originalEvent.getAllProperties().forEach(function (property) {
      // Get the property name
      const propName = property.name;

      // Skip recurrence-related properties
      if (propName !== 'rrule' && propName !== 'rdate' && propName !== 'exdate') {
        // Clone the property and add it to the new event
        // var clonedProperty = property.clone();
        newEvent.addProperty(property) //clonedProperty);
      }
    });

    // Update the dtstart for the specific occurrence
    newEvent.updatePropertyWithValue('dtstart', occurrenceDate);

    // Calculate the dtend based on the original duration
    try {
      // this fails if an event has no end date (maybe full day events?). so we catch this here
      const duration = eventComp.duration;
      const dtend = occurrenceDate.clone()
      dtend.addDuration(duration);
      newEvent.updatePropertyWithValue('dtend', dtend);
    } catch (error) {
      // we don't care if this fails
    }

    return new ical.Event(newEvent);
  } catch (error) {
    // we dont really care if this fails
  }

  return undefined;
}

export function getEventsInRange(icsContent, startDate, endDate) {
  startDate = new Date(startDate);
  endDate = new Date(endDate);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  icsContent = fixIcalFile(icsContent)
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
          const occurrenceDate = occurrence.toJSDate(); // Convert ICAL.Time objects to JavaScript Date objects

          if (occurrenceDate >= startDate && occurrenceDate <= endDate) {
            const clonedEvent = getOccurenceAsOwnEvent(eventComp, next)
            if (clonedEvent) {
              events.push(clonedEvent.toString())
            }
          }

          if (occurrenceDate > endDate) {
            break;
          }
        }
      } else {
        const eventStart = eventComp.startDate.toJSDate();
        const eventEnd = eventComp.endDate.toJSDate();

        // Handle single and multi-day events
        if (
          (eventStart >= startDate && eventStart <= endDate) || // Event starts within the range
          (eventEnd >= startDate && eventEnd <= endDate) ||     // Event ends within the range
          (eventStart <= startDate && eventEnd >= endDate)      // Event spans the entire range
        ) {
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

