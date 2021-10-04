import * as path from 'path';
import * as fs from 'fs';
import * as fileType from 'file-type';

interface Path {
  prefix: string[];
  name: string;
  ext?: string;
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

export const getFile = async ({ prefix, name, ext }: Path) => {
  return fs.createReadStream(
    path.join(path.resolve('./'), ...['public', ...prefix, `${name}.${ext}`]),
  );
};

export const getFileToBase64 = ({ prefix, name, ext }: Path) => {
  return fs
    .readFileSync(
      path.join(path.resolve('./'), ...['public', ...prefix, `${name}.${ext}`]),
    )
    .toString('base64');
};
