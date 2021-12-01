export const getAcronym = (sentence: string) =>
  sentence
    .split(' ')
    .map((word) => word.substr(0, 1).toUpperCase())
    .join('');
