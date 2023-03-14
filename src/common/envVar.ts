export interface Dict<T> {
  [key: string]: T | undefined;
}
let env = (typeof process === 'undefined') ? {} as Dict<string> : process.env;

export default env;