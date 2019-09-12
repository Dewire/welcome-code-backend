import { adminAPI } from '../libs/municipalityService';
import * as frontHandler from '../frontendApi/municipalityHandler';

export const getAllData =
  async (event, context, cb) =>
    frontHandler.getAllData(event, context, cb, adminAPI);

export const getDataById =
  async (event, context, cb) =>
    frontHandler.getDataById(event, context, cb, adminAPI);
