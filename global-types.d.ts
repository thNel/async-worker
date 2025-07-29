export {};

declare global {
  /**
   * Тип, который может быть неопределённым
   */
  type Optional<T> = T | undefined;

  /**
   * Тип, который может быть равен null
   */
  type Nullable<T> = T | null;

  /**
   * Тип, который может быть null или undefined
   */
  type Nullish<T> = T | null | undefined;
}
