import { eventInterceptor } from '../libs/utils';
import { getAreaOverViewByAreaId } from '../libs/areaOverviewService';
import { success, internalError, notFound } from '../../common/src/response';

export const getAreaOverview = async (event, context, cb) => {
  try {
    eventInterceptor(event);
    const { areaId } = event.pathParameters;
    const areaOverview = await getAreaOverViewByAreaId(areaId);
    if (!areaOverview) {
      cb(null, notFound({ msg: `AreaOverview areaId '${areaId}' not found.` }));
    } else {
      // TODO: Return only relevant preamble for language
      cb(null, success(areaOverview));
    }
  } catch (e) {
    cb(null, internalError(e));
  }
};
