import AWS from 'aws-sdk';
import { USER_POOL_ID } from './config';

const cognitoISP = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
});

export class UserPoolService {
  constructor(args) {
    this.userPoolId = undefined;
    if (new.target === UserPoolService) {
      Object.seal(this);
    }
    Object.assign(this, args);
  }
  async addGroup(name, description = '') {
    const params = {
      GroupName: name, /* required */
      UserPoolId: this.userPoolId, /* required */
      Description: description,
      // Precedence: 0,
      // RoleArn: 'STRING_VALUE',
    };
    console.log(`params ${JSON.stringify(params)}`);
    return new Promise((resolve, reject) => {
      cognitoISP.createGroup(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async removeGroup(name) {
    const params = {
      GroupName: name, /* required */
      UserPoolId: this.userPoolId, /* required */
    };
    console.log(`params ${JSON.stringify(params)}`);
    return new Promise((resolve, reject) => {
      cognitoISP.deleteGroup(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async getUsers(groupName) {
    const params = {
      GroupName: groupName, /* required */
      UserPoolId: this.userPoolId, /* required */
    };
    console.log(`params ${JSON.stringify(params)}`);
    return new Promise((resolve, reject) => {
      cognitoISP.listUsersInGroup(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
  async createUser(email) {
    const params = {
      UserPoolId: this.userPoolId, /* required */
      Username: email, /* required */
      UserAttributes: [
        { Name: 'email', Value: email }, /* required */
        { Name: 'name', Value: email }, /* required */
        { Name: 'email_verified', Value: 'true' }, /* required for password reset */
      ],
    };
    return new Promise((resolve, reject) =>
      cognitoISP.adminCreateUser(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      }));
  }
  async deleteUser(email) {
    const params = {
      UserPoolId: this.userPoolId, /* required */
      Username: email, /* required */
    };
    return new Promise((resolve, reject) =>
      cognitoISP.adminDeleteUser(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      }));
  }
  async addUserToGroup(email, groupName) {
    const params = {
      UserPoolId: this.userPoolId, /* required */
      Username: email, /* required */
      GroupName: groupName, /* required */
    };
    return new Promise((resolve, reject) =>
      cognitoISP.adminAddUserToGroup(params, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      }));
  }
}

export default new UserPoolService({
  userPoolId: USER_POOL_ID,
});
