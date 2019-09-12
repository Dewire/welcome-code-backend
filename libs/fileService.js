import AWS from 'aws-sdk';
import deepMap from 'deep-map';
import {
  BUCKET,
} from './config';

const s3 = new AWS.S3({ signatureVersion: 'v4' });

const requiredParameter = (name) => {
  throw new Error(`Missing required parameter ${name}.`);
};

function* PageIterator(params, api) {
  let page;
  do {
    page = new Promise((resolve, reject) => {
      api(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    yield page;
    console.log('PageIterator: Yielded page');
    // eslint-disable-next-line no-param-reassign
    params.continuationToken = page.NextContinuationToken;
  } while (page.IsTruncated);
}

export class FileService {
  constructor(bucket = BUCKET) {
    this.bucket = bucket;
  }

  async writeFile(args) {
    const {
      filePath = requiredParameter('filePath'),
      filename = requiredParameter('filename'),
      content = requiredParameter('content'),
      contentType = 'text/plain',
      ACL = 'public-read',
      metadata = {},
    } = args;
    const params = {
      Bucket: this.bucket, /* required */
      Key: filePath, /* required */
      // 'private | public-read | public-read-write | authenticated-read
      // | aws-exec-read | bucket-owner-read | bucket-owner-full-control',
      ACL,
      Body: content, // new Buffer('...') || 'STRING_VALUE' || streamObject,
      CacheControl: 'public,max-age=31557600',
      ContentType: contentType, // 'STRING_VALUE',
      // ContentDisposition: 'STRING_VALUE',
      // ContentEncoding: 'STRING_VALUE',
      // ContentLanguage: 'STRING_VALUE',
      // ContentLength: 0,
      // ContentMD5: 'STRING_VALUE',
      // Expires: new Date() || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
      // GrantFullControl: 'STRING_VALUE',
      // GrantRead: 'STRING_VALUE',
      // GrantReadACP: 'STRING_VALUE',
      // GrantWriteACP: 'STRING_VALUE',
      Metadata: deepMap({
        filename,
        contentType,
        ...metadata,
        /* anotherKey: ... */
      }, val => (typeof val === 'string' ? encodeURIComponent(val) : val)),
      // RequestPayer: 'requester',
      // SSECustomerAlgorithm: 'STRING_VALUE',
      // SSECustomerKey: new Buffer('...') || 'STRING_VALUE',
      // SSECustomerKeyMD5: 'STRING_VALUE',
      // SSEKMSKeyId: 'STRING_VALUE',
      // ServerSideEncryption: 'AES256 | aws:kms',
      // StorageClass: 'STANDARD | REDUCED_REDUNDANCY | STANDARD_IA',
      // Tagging: 'STRING_VALUE',
      // WebsiteRedirectLocation: 'STRING_VALUE',
    };
    return new Promise((resolve, reject) => {
      s3.putObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  async deleteFile(filePath = requiredParameter('filePath')) {
    const params = {
      Bucket: this.bucket,
      Key: filePath,
    };
    console.log('Deleting file using params: ', console.log(params));
    return new Promise((resolve, reject) => {
      s3.deleteObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  * listFolder(folder = requiredParameter('folder')) {
    const params = {
      Bucket: this.bucket, /* required */
      // ContinuationToken: 'STRING_VALUE',
      // Delimiter: 'STRING_VALUE',
      // EncodingType: url,
      // FetchOwner: true || false,
      // MaxKeys: 0,
      Prefix: folder,
      // RequestPayer: requester,
      // StartAfter: 'STRING_VALUE',
    };
    for (const page of PageIterator(params, s3.listObjectsV2)) {
      for (const file of page.Contents) {
        yield file;
      }
    }
  }

  static async deleteObjects(params) {
    console.log('deleteObjects: ', JSON.stringify(params));
    return new Promise((resolve, reject) => {
      s3.deleteObjects(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  * deleteFolder(folder) {
    console.log(`Delete folder ${folder}`);
    const maxObjectsPerRequest = 1000;
    const listParams = {
      Bucket: this.bucket, /* required */
      MaxKeys: maxObjectsPerRequest,
      Prefix: folder,
    };
    const deleteParams = {
      Bucket: this.bucket,
      Delete: {
        Objects: [],
        Quiet: false,
      },
    };
    const deletePage = async (data) => {
      if (!data || !data.Contents || data.Contents.length < 0) {
        console.log('No data to delete.');
      }
      deleteParams.Delete.Objects = data.Contents.map(c => ({ Key: c.Key }));
      console.log('deleteParams: ', JSON.stringify(deleteParams));
      return FileService.deleteObjects(deleteParams);
    };
    for (const page of PageIterator(listParams, s3.listObjectsV2.bind(s3))) {
      try {
        yield page.then(deletePage);
        console.log('yielded deleted page.');
      } catch (e) {
        console.log('Error in delete folder.');
        console.log(e);
        throw e;
      }
    }
  }
}

export default new FileService();
