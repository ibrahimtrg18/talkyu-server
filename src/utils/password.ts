import * as bcrypt from 'bcrypt';

export const generatePassword = async (
  password: string,
  saltOrRounds: number,
): Promise<string> => {
  try {
    const hash = await bcrypt.hash(password, saltOrRounds);

    return hash;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const comparePassword = async (
  password: string,
  hashPassword: string,
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashPassword);

  return isMatch;
};
