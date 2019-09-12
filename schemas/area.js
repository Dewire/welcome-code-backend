const AreaSchema = {
  name: {
    type: String,
  },
  areaId: {
    type: String,
    hashKey: true,
  },
  municipalityId: {
    type: String,
    index: {
      global: true,
      name: 'municipalityIndex',
      project: true, // ProjectionType: ALL
    },
  },
  coordinates: {
    type: Object,
  },
  nyko: {
    type: [String],
  },
  thumbnail: {
    url: String,
  },
  housingType: {
    type: [Number],
  },
};

export default AreaSchema;
