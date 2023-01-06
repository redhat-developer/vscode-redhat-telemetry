export interface Dict<T> {
  [key: string]: T | undefined;
}
let env = typeof process !== "undefined" ? process.env : ({} as Dict<string>);

export default env;
