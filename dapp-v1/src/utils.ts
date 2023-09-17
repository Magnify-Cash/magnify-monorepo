export function calculateTimeInfo(startTime, durationInHours) {
  // Convert the Unix timestamp to milliseconds
  const startTimeInMillis = startTime * 1000;

  // Calculate the end time in milliseconds
  const endTimeInMillis = startTimeInMillis + durationInHours * 3600 * 1000;

  // Create JavaScript date objects
  const currentDate = new Date();
  const startDate = new Date(startTimeInMillis);
  const endDate = new Date(endTimeInMillis);

  // Calculate remaining duration in milliseconds
  const currentTimeInMillis = currentDate.getTime();
  let remainingDurationInMillis = endTimeInMillis - currentTimeInMillis;

  // Check if remaining duration is negative and set it to zero if needed
  if (remainingDurationInMillis < 0) {
    remainingDurationInMillis = 0;
  }

  // Calculate elapsed duration in milliseconds
  let elapsedDurationInMillis = currentTimeInMillis - startTimeInMillis;

  // Check if elapsed duration is negative and set it to zero if needed
  if (elapsedDurationInMillis < 0) {
    elapsedDurationInMillis = 0;
  }

  // Calculate total duration in milliseconds
  const totalDurationInMillis = durationInHours * 3600 * 1000;

  // Calculate progress as a percentage
  const calculateProgress = (elapsedDurationInMillis / totalDurationInMillis) * 100;

  // Calculate remaining time
  let remainingTime;
  if (remainingDurationInMillis > 7 * 24 * 3600 * 1000) {
    const remainingWeeks = Math.floor(remainingDurationInMillis / (7 * 24 * 3600 * 1000));
    const remainingDays = Math.floor((remainingDurationInMillis % (7 * 24 * 3600 * 1000)) / (24 * 3600 * 1000));
    remainingTime = `${remainingWeeks} weeks and ${remainingDays} days`;
  } else if (remainingDurationInMillis > 24 * 3600 * 1000) {
    const remainingDays = Math.floor(remainingDurationInMillis / (24 * 3600 * 1000));
    remainingTime = `${remainingDays} days`;
  } else if (remainingDurationInMillis > 3600 * 1000) {
    const remainingHours = Math.floor(remainingDurationInMillis / (3600 * 1000));
    const remainingMinutes = Math.floor((remainingDurationInMillis % (3600 * 1000)) / (60 * 1000));
    remainingTime = `${remainingHours} hours and ${remainingMinutes} minutes`;
  } else {
    const remainingMinutes = Math.floor(remainingDurationInMillis / (60 * 1000));
    const remainingSeconds = Math.floor((remainingDurationInMillis % (60 * 1000)) / 1000);
    remainingTime = `${remainingMinutes} minutes and ${remainingSeconds} seconds`;
  }

  // Calculate elapsed time
  const elapsedDays = Math.floor(elapsedDurationInMillis / (24 * 3600 * 1000));
  const elapsedHours = Math.floor((elapsedDurationInMillis % (24 * 3600 * 1000)) / (3600 * 1000));
  const elapsedMinutes = Math.floor((elapsedDurationInMillis % (3600 * 1000)) / (60 * 1000));
  const elapsedSeconds = Math.floor((elapsedDurationInMillis % (60 * 1000)) / 1000);
  const elapsedTime = `${elapsedDays}D ${elapsedHours}HR ${elapsedMinutes}MIN ${elapsedSeconds}SEC`;

  // Check if there is any time left
  const isTimeLeft = remainingDurationInMillis > 0;

  // Return the values as an object
  return {
    startDate,
    endDate,
    remainingTime,
    elapsedTime,
    isTimeLeft,
    calculateProgress,
  };
}

export function formatTimeInfo(dateTime) {
  const options = {
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
  };
  return dateTime.toLocaleString(undefined, options);
}