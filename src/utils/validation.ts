export const isEmail = (str: string): boolean => {
  if (!str) {
    return false;
  }
  return /\S+@\S+\.\S+/.test(str);
};
