import * as bcrypt from 'bcrypt';

export const generatePassword = async (
  password: string,
  saltOrRounds: number,
): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  } catch (e) {
    console.error(e);
    throw new Error(e);
  }
};

export const comparePassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashPassword);

  return isMatch;
};
