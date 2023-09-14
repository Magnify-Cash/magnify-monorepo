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

  // Calculate remaining days and hours
  const remainingDays = Math.floor(remainingDurationInMillis / (24 * 3600 * 1000));
  remainingDurationInMillis %= 24 * 3600 * 1000;
  const remainingHours = Math.floor(remainingDurationInMillis / (3600 * 1000));

  // Construct the remaining time string
  let remainingTime;
  if (remainingDays > 0) {
	remainingTime = `${remainingDays} days and ${remainingHours} hours`;
  } else {
	remainingTime = `${remainingHours} hours`;
  }

  // Calculate elapsed duration in milliseconds
  let elapsedDurationInMillis = currentTimeInMillis - startTimeInMillis;

  // Check if elapsed duration is negative and set it to zero if needed
  if (elapsedDurationInMillis < 0) {
	elapsedDurationInMillis = 0;
  }

  // Calculate elapsed days
  const elapsedDays = Math.floor(elapsedDurationInMillis / (24 * 3600 * 1000));

  // Calculate elapsed hours
  const elapsedHours = Math.floor((elapsedDurationInMillis % (24 * 3600 * 1000)) / (3600 * 1000));

  // Calculate total days and total hours
  const totalDays = Math.floor(durationInHours / 24);
  const totalHours = durationInHours % 24;

  // Construct the elapsed time string
  const elapsedTime = `${elapsedDays}D ${elapsedHours}HR / ${totalDays}D ${totalHours}HR`;


  // Check if there is any time left
  const isTimeLeft = remainingDurationInMillis > 0;

  // Return the values as an object
  return {
	startDate,
	endDate,
	remainingTime,
	elapsedTime,
	isTimeLeft,
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