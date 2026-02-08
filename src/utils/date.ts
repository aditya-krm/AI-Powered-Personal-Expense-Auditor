/**
 * Returns a new Date object set to the start of the day (00:00:00.000)
 */
export const startOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

/**
 * Returns a new Date object set to the end of the day (23:59:59.999)
 */
export const endOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};
