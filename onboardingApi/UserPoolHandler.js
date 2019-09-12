import { eventInterceptor } from '../libs/utils';
import { success, internalError, unauthorized, notImplemented } from '../../common/src/response';
import { authorize } from '../libs/authorizerService';
import userPoolService from '../libs/UserPoolService';
import { runOrders } from '../libs/OrderService';
import { createUserOrder } from './orders/UserPoolOrders';

const getUsersForGroup = async (event, context, cb) => {
  try {
    const {
      pathParameters: {
        municipality,
      } = {},
    } = event;

    if (!await authorize(event, municipality, false)) {
      return cb(null, unauthorized('Unauthorized'));
    }

    console.log(`key: ${JSON.stringify({ id: municipality })}`);
    return cb(null, success(await userPoolService.getUsers(municipality)));
  } catch (e) {
    return cb(null, internalError(e));
  }
};

const createUser = async (event, context, cb) => {
  try {
    const {
      body,
    } = event;
    const data = JSON.parse(body);
    const {
      municipality,
      groupName,
      email,
    } = data;

    if (!await authorize(event, municipality, false)) {
      return cb(null, unauthorized('Unauthorized'));
    }

    console.log(`key: ${JSON.stringify({ id: municipality, email })}`);
    return cb(null, success(await runOrders(createUserOrder(email, groupName))));
  } catch (e) {
    return cb(null, internalError(e));
  }
};

module.exports.handler = (event, ctx, cb) => {
  eventInterceptor(event);
  console.log(event);
  const { httpMethod } = event;
  switch (httpMethod) {
    case 'GET':
      getUsersForGroup(event, ctx, cb);
      break;
    case 'POST':
      createUser(event, ctx, cb);
      break;
    default:
      cb(null, notImplemented('Not implemented yet.'));
      break;
  }
};
