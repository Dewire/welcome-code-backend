import { UserGroup } from './dynamoDB';
import { globalUpdateOptions } from './config';

export const getGroupsByName = async municipality => UserGroup.queryOne('id').eq(municipality.toLowerCase()).exec();

export const setGroups = async (municipality, update) => {
  const operation = { $PUT: update };
  return UserGroup.update(municipality.toLowerCase(), operation, globalUpdateOptions);
};

export const delByName = async name => UserGroup.delete({ id: name.toLowerCase() });

export const publicAPI = {
  getGroupsByName,
};

export const appAdminAPI = {
  getGroupsByName,
  setGroups,
};
