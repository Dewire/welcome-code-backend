import sha1 from 'sha1';
import axios from 'axios';
import { eventInterceptor } from '../libs/utils';
import { success, error } from '../../common/src/response';

const getUniqueData = (callerId, key) => {
  const time = +new Date();
  const unique = (Math.random().toString(36) + Math.random().toString(36)).substring(0, 16);
  const hash = sha1(callerId + time + key + unique);
  return { time, unique, hash };
};

const buildRequest = (url, data, callerId, key) => {
  const {
    q, limit, offset, areaId, center, dim, objectType,
  } = data;
  const {
    time, unique, hash,
  } = getUniqueData(callerId, key);

  return axios.get(url, {
    params: {
      q: q || '',
      limit: limit || 4,
      offset: offset || 0,
      callerId,
      time,
      unique,
      hash,
      areaId,
      center,
      dim,
      objectType,
    },
  });
};

const booliCallSold = (event, context, cb, url, errMsg) => {
  if (!event.body) {
    cb(null, error({ error: 'Missing body!' }));
    return;
  }

  const callerId = process.env.BOOLI_CALLER_ID;
  const key = process.env.BOOLI_API_KEY;
  const promises = [];

  const areas = JSON.parse(event.body);
  areas.forEach((data) => {
    promises.push(buildRequest(url, data, callerId, key));
  });

  axios.all(promises)
    .then((response) => {
      const allData = response.map(r => r.data);
      cb(null, success(allData));
    }).catch((err) => {
      cb(null, { error: err, errMsg });
    });
};

const booliCallListings = (event, context, cb, url, errMsg) => {
  if (!event.queryStringParameters) {
    cb(null, error({ error: 'Missing query parameters!' }));
    return;
  }

  const callerId = process.env.BOOLI_CALLER_ID;
  const key = process.env.BOOLI_API_KEY;

  buildRequest(url, event.queryStringParameters, callerId, key)
    .then((response) => {
      cb(null, success(response.data));
    }).catch((err) => {
      cb(null, err({ error: errMsg }));
    });
};

export const listings = (event, context, cb) => {
  eventInterceptor(event);
  booliCallListings(event, context, cb, 'https://api.booli.se/listings', 'Failed to fetch listings from Booli API.');
};

export const sold = (event, context, cb) => {
  eventInterceptor(event);
  booliCallSold(event, context, cb, 'https://api.booli.se/sold', 'Failed to fetch sold objects from Booli API.');
};
