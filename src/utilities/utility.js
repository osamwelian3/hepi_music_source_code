import moment from "moment";

export function formatNumber(number) {
    if (number < 1000) {
      // Numbers less than 1000 are displayed as they are
      return number.toLocaleString();
    } else if (number >= 1000 && number < 1000000) {
      // Numbers between 1000 and 999,999 are displayed as X.Xk
      return (number / 1000).toFixed(1) + 'k';
    } else if (number >= 1000000) {
      // Numbers greater than or equal to 1 million are displayed as X.Xm
      return (number / 1000000).toFixed(1) + 'M';
    } else {
      // Not a number, return 0
      return 0;
    }
  }

export function replaceLastAtEnd(inputString, searchValue, replaceValue) {
  const lastIndex = inputString.lastIndexOf(searchValue);
  if (lastIndex !== -1 && lastIndex === inputString.length - searchValue.length) {
    return inputString.slice(0, lastIndex) + replaceValue;
  }
  return inputString;
}

export function timelineFormat(createdAt){
  // Get the moment object for the createdAt date
  const createdAtMoment = moment(createdAt);

  // Get the current moment
  const currentMoment = moment();

  // Calculate the difference in days
  const daysDiff = currentMoment.diff(createdAtMoment, 'days');
  let timeline;
  if (daysDiff === 0) {
    timeline = 'Released today';
  } else if (daysDiff === 1) {
    timeline = 'Released yesterday';
  } else if (daysDiff > 1 && daysDiff < 3) {
    timeline = `Released ${daysDiff} days ago`;
  } else if (daysDiff >= 3 && daysDiff < 30) {
    timeline = `Released ${createdAtMoment.fromNow()}`;
  } else if (daysDiff >= 30 && daysDiff < 365) {
    timeline = `Released ${createdAtMoment.format('MMMM Do')}`;
  } else {
    timeline = `Released ${createdAtMoment.format('MMMM Do, YYYY')}`;
  }
  return timeline;
}
  