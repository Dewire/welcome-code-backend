import { publicAPI } from './UserGroupService';

const SYSTEM_ADMIN = 'ApplicationAdmin';

const getAuthParams = async (event) => {
  const {
    requestContext: {
      authorizer: {
        claims,
      },
    },
  } = event;

  let groups = claims['cognito:groups'];
  // AWS returns comma seperated string,
  // AWS offline returns array
  if (typeof groups === 'string') {
    groups = groups.split(',');
  }
  return { groups };
};

const isSystemAdmin = groups => groups && groups.includes(SYSTEM_ADMIN);
const isMunicipalityAdmin = async (groups, municipality) => {
  if (groups) {
    const userGroups = await publicAPI.getGroupsByName(municipality);
    const acl = userGroups ? userGroups.adminGroups : undefined;
    console.log(`acl: ${acl}`);
    return groups
      .some(group =>
        acl && acl.includes(group));
  }
  return false;
};

export const authorize = async (event, municipality, allowMunicipalityAdmin = true) => {
  try {
    const { groups } = await getAuthParams(event);
    if (!groups) { console.error('User cognito groups empty, does the user have the right groups added in Cognito?'); }
    return isSystemAdmin(groups)
      || (allowMunicipalityAdmin && municipality && isMunicipalityAdmin(groups, municipality));
  } catch (e) {
    console.log(e, e.stack);
    return false;
  }
};
