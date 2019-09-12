import { appAdminAPI } from '../../libs/municipalityService';
import {
  createByName as createAboutMunicipality,
  delByName as delAboutMuni,
} from '../../libs/aboutMunicipalityService';
import {
  appAdminAPI as appAdminAreasAPI,
} from '../../libs/areaService';
import fileService from '../../libs/fileService';
import userPoolService from '../../libs/UserPoolService';
import { setGroups, delByName as delGroups } from '../../libs/UserGroupService';
import { DEFAULT_MUNICIPALITY } from './DefaultMunicipality';
import { DEFAULT_ABOUT_MUNICIPALITY } from './DefaultAboutMunicipality';

const {
  create: createMunicipality,
  update: updateMuncipality,
  delByName: delMunicipality,
} = appAdminAPI;

const getGroupName = municipality => `${municipality.charAt(0).toUpperCase() + municipality.slice(1).toLowerCase()}Admin`;
const asyncSleep = async ms => new Promise(resolve => setTimeout(resolve, ms));


export const createMunicipalityOrder = (municipality) => {
  // eslint-disable-next-line no-param-reassign
  municipality = municipality.toLowerCase();
  return {
    AddUserPoolGroup: [
      async () => userPoolService.addGroup(
        getGroupName(municipality),
        `${municipality} municipality admin`,
      ),
      async () => userPoolService.removeGroup(getGroupName(municipality)),
    ],
    SetAdminGroupRoles: [
      async () => setGroups(municipality, { adminGroups: [getGroupName(municipality)] }),
      async () => delGroups(municipality),
    ],
    CreateMunicipalityTableItem: [
      async () => createMunicipality(municipality, DEFAULT_MUNICIPALITY)
        .then(asyncSleep(5000/* ms */)),
      async () => delMunicipality(municipality),
    ],
    CreateAboutMunicipalityItem: [
      async () => createAboutMunicipality(municipality, DEFAULT_ABOUT_MUNICIPALITY)
        .then(asyncSleep(5000/* ms */)),
      async () => delAboutMuni(municipality),
    ],
    CreateImageStorePrefix: [
      async () => fileService.writeFile({
        filePath: `${municipality}/.placeholder`,
        filename: '.placeholder',
        content: '',
      }),
      async () => fileService.deleteFile(`${municipality}/.placeholder`),
    ],
  };
};
export const removeMunicipalityOrder = municipality => ({
  RemoveUserPoolGroup: [async () => userPoolService.removeGroup(getGroupName(municipality))],
  RemoveUserGroupMappings: [async () => delGroups(municipality)],
  RemoveMunicipalityAreas: [async () => Promise.all((
    await appAdminAreasAPI.getAreasFromMunicipalityName(municipality))
    .map(async area => appAdminAreasAPI.delById(area.areaId)))],
  RemoveFromMunicipalityTable: [async () => delMunicipality(municipality)],
  RemoveAboutMuni: [async () => delAboutMuni(municipality)],
  RemoveMunicipalityFiles: [
    async () => Promise.all([...fileService.deleteFolder(municipality)]),
  ],
});

export const enableMunicipalityOrder = municipality => ({
  EnableMunicipality: [
    async () => updateMuncipality(municipality, { enabled: true }),
  ],
});

export const disableMunicipalityOrder = municipality => ({
  DisableMuncipality: [
    async () => updateMuncipality(municipality, { enabled: false }),
  ],
});
