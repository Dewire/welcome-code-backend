import dynamoose from 'dynamoose';
import {
  municipalityMock,
  areaMock,
  aboutMunicipalityMock,
  aboutServiceMock,
  areaOverviewMock,
  userGroupMock,
} from '../mock_data';
import {
  AWS_OFFLINE,
  MUNICIPALITY_TABLE_NAME,
  AREA_TABLE_NAME,
  POPULATE_MOCK_DATA,
  ABOUT_MUNICIPALITY_TABLE_NAME,
  ABOUT_SERVICE_TABLE_NAME,
  AREA_OVERVIEW_TABLE_NAME,
  USER_GROUP_TABLE_NAME,
} from './config';
import {
  muniSchema,
  areaSchema,
  aboutMuniSchema,
  aboutServiceSchema,
  areaOverviewSchema,
  userGroupSchema,
} from '../schemas';

if (AWS_OFFLINE) {
  dynamoose.local(); // Run dynamoDB local serverless plugin instead of the real deal
}

const schemaOpts = {
  timestamps: true,
};

const modelOpts = {
  update: false,
};

export const Municipality = dynamoose.model(
  MUNICIPALITY_TABLE_NAME,
  new dynamoose.Schema(muniSchema, schemaOpts),
  modelOpts,
);

export const Area = dynamoose.model(
  AREA_TABLE_NAME,
  new dynamoose.Schema(areaSchema, schemaOpts),
  modelOpts,
);

export const AboutMunicipality = dynamoose.model(
  ABOUT_MUNICIPALITY_TABLE_NAME,
  new dynamoose.Schema(aboutMuniSchema, schemaOpts),
  modelOpts,
);

export const AboutService = dynamoose.model(
  ABOUT_SERVICE_TABLE_NAME,
  new dynamoose.Schema(aboutServiceSchema, schemaOpts),
  modelOpts,
);

export const AreaOverview = dynamoose.model(
  AREA_OVERVIEW_TABLE_NAME,
  new dynamoose.Schema(areaOverviewSchema, schemaOpts),
  modelOpts,
);

export const UserGroup = dynamoose.model(
  USER_GROUP_TABLE_NAME,
  new dynamoose.Schema(userGroupSchema, schemaOpts),
  modelOpts,
);

const populateTestData = () => {
  Municipality.batchPut(municipalityMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock Municipality data: ${err}`);
    }
  });

  Area.batchPut(areaMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock Area data: ${err}`);
    }
  });

  AboutMunicipality.batchPut(aboutMunicipalityMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock About Municipality data: ${err}`);
    }
  });

  AboutService.batchPut(aboutServiceMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock About Service data: ${err}`);
    }
  });

  AreaOverview.batchPut(areaOverviewMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock Area Overview data: ${err}`);
    }
  });

  UserGroup.batchPut(userGroupMock, (err) => {
    if (err) {
      throw new Error(`Error populating mock User Group data: ${err}`);
    }
  });
};

let hasPopulated = false;
if (POPULATE_MOCK_DATA && !hasPopulated) {
  // Check if data already populated, if this is true do nothing
  Municipality.queryOne('name').eq('sundsvall').exec((err, muni) => {
    if (!muni) {
      console.log(err);
      console.log('Populating mock data.');
      populateTestData();
      hasPopulated = true;
    }
  });
}
