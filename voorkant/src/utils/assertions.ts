export function assertIsDefined<T>(
  val: unknown,
): asserts val is NonNullable<T> {
  if (val === null || typeof val === "undefined") {
    throw new TypeError("Value is not defined!");
  }
}
