const MunicipalitySchema = {
  name: {
    type: String,
    hashKey: true,
    index: [
      {
        name: 'EnabledIndex',
        global: true,
        rangeKey: 'enabled',
        project: true,
      },
    ],
  },
  municipalityId: {
    type: String,
    index: [
      {
        global: true,
        rangeKey: 'enabled',
        name: 'IdIndexEnabledRange',
        project: true, // ProjectionType: ALL
      },
    ],
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  mapCredentials: {
    type: Object,
  },
  googleApiKey: {
    type: String,
  },
  initialMapState: {
    type: Object,
  },
  preamble: {
    type: Object,
  },
  logoImage: {
    type: String,
  },
  backgroundImage: {
    type: String,
  },
  contact: {
    type: Object,
  },
  theme: {
    type: String,
    validate(v) {
      const themes = ['green', 'orange', 'blue'];
      return undefined === v || ~themes.indexOf(v); // eslint-disable-line
    },
  },
};

export default MunicipalitySchema;
