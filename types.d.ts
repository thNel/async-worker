type Optional<T> = T | undefined;

type Nullable<T> = T | null;

type Nullish<T> = Nullable<Optional<T>>;
