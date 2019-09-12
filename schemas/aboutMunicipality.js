const carouselUrl = {
  index: Number,
  url: String,
};

const section = {
  index: Number,
  type: String,
  paragraph: Object,
  carouselUrls: [carouselUrl],
  videoUrl: String,
};

const mainContent = {
  topContent: Object,
  section: [section],
  text: String,
};

const AboutMunicipalitySchema = {
  aboutMunicipalityId: {
    type: String,
    hashKey: true,
  },
  municipalityId: {
    type: String,
    index: {
      name: 'MunicipalityIndex',
      global: true,
      project: true,
    },
  },
  content: mainContent,
};

export default AboutMunicipalitySchema;
