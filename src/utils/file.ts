import * as path from 'path';
import * as fs from 'fs';
import * as fileType from 'file-type';

interface Path {
  prefix: string[];
  name: string;
  mimetype?: string;
  ext?: string;
}

export const createFile = async (base64: string, { prefix, name }: Path) => {
  const cleanBase64 = base64.split(',')[1];
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
    path.join(
      path.resolve('./'),
      ...['public', ...prefix, ext ? `${name}.${ext}` : name],
    ),
  );
};

export const getFileToBase64 = ({ prefix, name, ext, mimetype = '' }: Path) => {
  return formatBase64({
    mimetype,
    encoded: fs
      .readFileSync(
        path.join(
          path.resolve('./'),
          ...['public', ...prefix, ext ? `${name}.${ext}` : name],
        ),
      )
      .toString('base64'),
  });
};

const formatBase64 = ({ mimetype, charset = 'base64', encoded }) => {
  return `data:${mimetype};${charset},${encoded}`;
};
