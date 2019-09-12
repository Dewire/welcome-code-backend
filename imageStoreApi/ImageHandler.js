import uuidv4 from 'uuid/v4';
import { normalize } from 'path';
import { eventInterceptor } from '../libs/utils';
import { success, internalError, unauthorized, notImplemented } from '../../common/src/response';
import { authorize } from '../libs/authorizerService';
import fileService from '../libs/fileService';

const createOrUpdate = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      },
      body,
    } = event;
    const data = JSON.parse(body);
    const {
      filename,
      contentType,
      body: content,
      isBase64,
    } = data;
    if (!await authorize(event, municipality, true)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    cb(null, success(await fileService.writeFile({
      filePath: `${municipality}/${uuidv4()}`,
      filename,
      content: isBase64 ? Buffer.from(content, 'base64') : content,
      contentType,
    })));
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

const deleteObject = async (event, ctx, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
        proxy,
      },
    } = event;
    if (!await authorize(event, municipality, true)) {
      cb(null, unauthorized('Unauthorized'));
      return;
    }
    await fileService.deleteFile(`${municipality}/${normalize(proxy)}`);
    cb(null, success());
  } catch (e) {
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};

module.exports.file = (event, ctx, cb) => {
  eventInterceptor(event);
  console.log(event);
  const { httpMethod } = event;
  switch (httpMethod) {
    case 'POST':
    case 'PUT':
      createOrUpdate(event, ctx, cb);
      break;
    case 'DELETE':
      deleteObject(event, ctx, cb);
      break;
    default:
      cb(null, notImplemented('Not implemented yet.'));
      break;
  }
};
