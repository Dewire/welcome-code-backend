const section = {
  index: Number,
  type: String,
  content: Object,
};

const carouselUrl = {
  index: Number,
  url: String,
};

const AreaOverviewSchema = {
  id: {
    type: String,
    hashKey: true,
  },
  // TODO This should be the hashkey instead,
  // areaId is the only query that is done.
  areaId: {
    type: String,
    index: {
      global: true,
      name: 'AreaIdOverviewIndex',
      project: true,
    },
  },
  carouselUrls: [carouselUrl],
  preamble: Object,
  section: [section],
};

export default AreaOverviewSchema;
