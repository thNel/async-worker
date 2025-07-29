type Optional<T> = T | undefined;
type Nullable<T> = T | null;
type Insecure<T> = Optional<Nullable<T>>;
