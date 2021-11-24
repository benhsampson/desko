export const isInPast = (date: Date) =>
  date.getTime() < new Date().setHours(0, 0, 0, 0);
