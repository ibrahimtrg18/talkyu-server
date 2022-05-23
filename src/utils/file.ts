import * as fileType from 'file-type';
import * as fs from 'fs';
import * as mime from 'mime-types';
import * as path from 'path';
import * as util from 'util';

const readdir = util.promisify(fs.readdir);

interface Path {
  prefix: string[];
  name: string;
}

export const createFile = async (base64: string, { prefix, name }: Path) => {
  const cleanBase64 = base64.split(',')[1];
  const buffer = Buffer.from(cleanBase64, 'base64');
  const file = await fileType.fromBuffer(buffer);
  fs.writeFileSync(
    path.join(
      path.resolve('./'),
      ...['public', ...prefix, `${name}.${file.ext}`],
    ),
    buffer,
  );
  return `${name}.${file.ext}`;
};

export const getFile = async ({
  prefix,
  name,
}: Path): Promise<[fs.ReadStream, string | boolean]> => {
  try {
    const files = await readdir(
      path.join(path.resolve('./'), ...['public', ...prefix]),
    );

    const filename = files.find(
      (file) => path.basename(file, path.extname(file)) === name,
    );

    if (!filename) {
      return [null, 'application/json'];
    }

    return [
      fs.createReadStream(
        path.join(path.resolve('./'), ...['public', ...prefix, filename]),
      ),
      mime.lookup(filename) as string,
    ];
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getFileToBase64 = async ({ prefix, name }: Path) => {
  try {
    const files = await readdir(
      path.join(path.resolve('./'), ...['public', ...prefix]),
    );

    const filename = files.find(
      (file) => path.basename(file, path.extname(file)) === name,
    );

    if (!filename) {
      return null;
    }

    const file = formatBase64({
      mimetype: mime.lookup(filename),
      encoded: fs
        .readFileSync(
          path.join(path.resolve('./'), ...['public', ...prefix, filename]),
        )
        .toString('base64'),
    });

    return file;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

const formatBase64 = ({ mimetype, charset = 'base64', encoded }) => {
  return `data:${mimetype};${charset},${encoded}`;
};
