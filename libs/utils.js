import debug from 'debug';
import deepMap from 'deep-map';

const dbg = debug('Welcome::utils');

const uriDecode = (event) => {
  deepMap(event, (val) => { dbg('urlDecoding', val); return (typeof val === 'string' ? decodeURIComponent(val) : val); }, { inPlace: true });
};

export const eventInterceptor = (event) => {
  dbg('raw event', event);
  uriDecode(event.pathParameters);
  uriDecode(event.queryStringParameters);
  dbg('transformed event', event);
};
