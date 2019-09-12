import { AreaOverview } from './dynamoDB';

export const getAreaOverViewByAreaId = async areaId => AreaOverview.queryOne('areaId').using('AreaIdOverviewIndex').eq(areaId).exec();
