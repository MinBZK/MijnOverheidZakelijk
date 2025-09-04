export const isDefined = <T>(val: T): val is NonNullable<T> => {
  return val !== null && typeof val !== "undefined";
};
