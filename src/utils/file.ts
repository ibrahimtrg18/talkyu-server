import * as path from 'path';
import * as fs from 'fs';
import * as fileType from 'file-type';

interface Path {
  prefix: string[];
  name: string;
  file?: string;
}

export const createFile = async (base64: string, { prefix, name }: Path) => {
  const cleanBase64 = base64.replace(/^data:image\/png;base64,/, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  const file = await fileType.fromBuffer(buffer);
  return fs.writeFileSync(
    path.join(
      path.resolve('./'),
      ...['public', ...prefix, `${name}.${file.ext}`],
    ),
    buffer,
  );
};

export const getFileToBase64 = ({ prefix, name, file }: Path) => {
  return fs.readFileSync(
    path.join(path.resolve('./'), ...['public', ...prefix, `${name}.${file}`]),
    {
      encoding: 'base64',
    },
  );
};
