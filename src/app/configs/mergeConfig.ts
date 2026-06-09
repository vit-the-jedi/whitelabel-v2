export type DeepPartial<T> = T extends (...args: any[]) => any
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const mergeValues = (base: unknown, override: unknown): unknown => {
  if (override === undefined) {
    return base;
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const result: Record<string, unknown> = { ...base };

    for (const key of Object.keys(override)) {
      result[key] = mergeValues(base[key], override[key]);
    }

    return result;
  }

  return override;
};

export const mergeConfig = <T>(base: T, overrides: DeepPartial<T>): T =>
  mergeValues(base, overrides) as T;