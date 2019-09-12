const requiredParameter = (name) => {
  throw new Error(`Missing required parameter ${name}.`);
};

const recordSuccess = (orderLog, name, result) => {
  // eslint-disable-next-line no-param-reassign
  orderLog[name] = {
    status: 'success',
    result,
  };
};

const recordFailure = (orderLog, name, error) => {
  // eslint-disable-next-line no-param-reassign
  orderLog[name] = {
    status: 'failed',
    error,
    stack: error.stack,
  };
};

export const runOrders = async (order = requiredParameter('order'), failFast = true) => {
  const orderLog = {};
  const rollbacks = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const [name, [orderStep, rollbackStep]] of Object.entries(order)) {
    try {
      console.log(`Executing step ${name} ${orderStep !== undefined} ${rollbackStep !== undefined}`);
      // eslint-disable-next-line no-await-in-loop
      recordSuccess(orderLog, name, await orderStep());
      if (rollbackStep) {
        console.log('Adding rollbackstep');
        rollbacks[`Rollback ${name}`] = [rollbackStep];
      }
    } catch (stepError) {
      console.log(`rollbacks ${JSON.stringify(rollbacks)}`);
      recordFailure(orderLog, name, stepError);
      if (Object.keys(rollbacks).length > 0) {
        console.log('Attempting to rollback order.');
        try {
          // eslint-disable-next-line no-await-in-loop
          throw Object.assign(orderLog, await runOrders(rollbacks, false));
        } catch (rollbackLog) {
          if (!(rollbackLog instanceof Error)) {
            Object.assign(orderLog, rollbackLog);
          }
          throw rollbackLog;
        }
      } else if (failFast) {
        console.log('No rollback steps, failing fast.');
        throw orderLog;
      }
    }
  }
  return orderLog;
};
