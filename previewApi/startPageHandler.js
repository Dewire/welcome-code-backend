import { adminAPI } from '../libs/municipalityService';
import * as frontHandler from '../frontendApi/startPageHandler';

export const getStartPageData =
  async (event, context, cb) =>
    frontHandler.getStartPageData(event, context, cb, adminAPI);
