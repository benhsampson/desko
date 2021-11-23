export const getDateToday = () => {
  const current = new Date();
  const today = new Date(
    current.getFullYear(),
    current.getMonth(),
    current.getDate()
  );
  return today;
};
