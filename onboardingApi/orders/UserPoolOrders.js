import userPoolService from '../../libs/UserPoolService';

const asyncSleep = async ms => new Promise(resolve => setTimeout(resolve, ms));

export const createUserOrder = (email, groupName) => ({
  CreateUser: [
    async () => userPoolService.createUser(email)
      .then(asyncSleep(5000/* ms */)),
    async () => userPoolService.deleteUser(email),
  ],
  AddUserToGroup: [
    async () => userPoolService.addUserToGroup(email, groupName),
  ],
});
