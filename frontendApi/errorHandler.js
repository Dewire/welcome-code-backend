import { eventInterceptor } from '../libs/utils';
import { notImplemented, success, internalError } from '../../common/src/response';
import { describeLogGroups, createLogGroup, createLogStream, putLogEvents, describeLogStreams } from '../libs/awsLogGroupService';

const sendError = async (event) => {
  const {
    body,
  } = event;
  const jsonData = JSON.parse(body);
  const { errorOrigin, label } = jsonData;
  const describeLogGroupsResult = await describeLogGroups({ logGroupNamePrefix: errorOrigin });
  let tempToken;

  const params = {
    logGroupName: errorOrigin,
    logStreamName: `${errorOrigin}ErrorStream`,
  };

  if (describeLogGroupsResult.logGroups.length === 0) {
    console.log(`Creating missing log group: "${errorOrigin}"`);
    await createLogGroup({ logGroupName: errorOrigin });
  }

  const logStreamResult = await describeLogStreams({
    logGroupName: errorOrigin,
    logStreamNamePrefix: `${errorOrigin}ErrorStream`,
  });

  if (logStreamResult.logStreams[0] &&
    logStreamResult.logStreams[0].logStreamName === `${errorOrigin}ErrorStream`) {
    tempToken = logStreamResult.logStreams[0].uploadSequenceToken;
  } else if (logStreamResult.logStreams.length === 0) {
    await createLogStream(params);
  }

  return putLogEvents({
    ...params,
    logEvents: [
      {
        message: label,
        timestamp: Date.now(),
      },
    ],
    sequenceToken: tempToken,
  });
};

export const file = async (event, ctx, cb) => {
  eventInterceptor(event);
  console.log(event);
  const { httpMethod } = event;
  try {
    switch (httpMethod) {
      case 'PUT':
        cb(null, success(await sendError(event)));
        break;

      default:
        cb(null, notImplemented('Not implemented yet.'));
        break;
    }
  } catch (e) {
    console.log('externa stack tracet');
    console.log(e, e.stack);
    cb(null, internalError(e));
  }
};
