export function partition<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
) {
  return array.reduce(
    (acc, elem, index) => {
      if (predicate(elem, index, array)) {
        acc[0].push(elem);
      } else {
        acc[1].push(elem);
      }

      return acc;
    },
    [[], []] as [T[], T[]]
  );
}
