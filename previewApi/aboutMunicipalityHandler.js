import { adminAPI } from '../libs/aboutMunicipalityService';
import * as frontHandler from '../frontendApi/aboutMunicipalityHandler';

export const getAboutMunicipality =
  async (event, ctx, cb) => frontHandler.getAboutMunicipality(event, ctx, cb, adminAPI);
