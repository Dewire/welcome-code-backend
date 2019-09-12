import AWS from 'aws-sdk';

AWS.config.update({ region: 'eu-west-1' });
AWS.config.apiVersions = { cloudwatchlogs: '2016-04-18' };

const cloudwatchlogs = new AWS.CloudWatchLogs();

export const describeLogGroups = params =>
  new Promise((resolve, reject) => {
    cloudwatchlogs.describeLogGroups(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export const createLogGroup = params =>
  new Promise((resolve, reject) => {
    cloudwatchlogs.createLogGroup(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export const describeLogStreams = params =>
  new Promise((resolve, reject) => {
    cloudwatchlogs.describeLogStreams(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export const createLogStream = params =>
  new Promise((resolve, reject) => {
    cloudwatchlogs.createLogStream(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
export const putLogEvents = params =>
  new Promise((resolve, reject) => {
    cloudwatchlogs.putLogEvents(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        reject(err);
      } else {
        console.log(data);
        resolve(data);
      }
    });
  });
