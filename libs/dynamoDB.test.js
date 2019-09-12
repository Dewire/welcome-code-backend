describe('dynamoDB', () => {
  describe('AWS_LOCAL', () => {
    let mockedLocal;
    let mockedModel;
    beforeEach(() => {
      jest.resetModules();
      mockedLocal = jest.fn();
      mockedModel = jest.fn(() => ({
        batchPut: jest.fn(),
      }));

      jest.doMock('dynamoose', () => ({
        local: mockedLocal,
        Schema: jest.fn(),
        model: mockedModel,
      }));
    });

    it('Should run local if AWS_OFFLINE is true.', () => {
      jest.doMock('./config', () => ({
        AWS_OFFLINE: true,
      }));

      require('./dynamoDB');
      expect(mockedLocal).toHaveBeenCalled();
    });
    /*
    it('Should populate test data if POPULATE_MOCK_DATA is true.', () => {
      jest.doMock('./config', () => ({
        POPULATE_MOCK_DATA: true,
      }));

      const { Municipality, Area, AboutMunicipality } = require('./dynamoDB');
      expect(Municipality.batchPut).toHaveBeenCalled();
      expect(Area.batchPut).toHaveBeenCalled();
      expect(AboutMunicipality.batchPut).toHaveBeenCalled();
    });
    */
    it('Should not run local if AWS_OFFLINE is false.', () => {
      jest.doMock('./config', () => ({
        AWS_OFFLINE: false,
      }));

      require('./dynamoDB');
      expect(mockedLocal).not.toHaveBeenCalled();
    });
    it('Should not populate testdata if POPULATE_MOCK_DATA is false.', () => {
      jest.doMock('./config', () => ({
        POPULATE_MOCK_DATA: false,
      }));

      const { Municipality, Area } = require('./dynamoDB');
      expect(Municipality.batchPut).not.toHaveBeenCalled();
      expect(Area.batchPut).not.toHaveBeenCalled();
    });
    /*
    it('Should throw error if populating municipality test data fails.', () => {
      jest.doMock('./config', () => ({
        POPULATE_MOCK_DATA: true,
      }));
      const mockedDynamoose = require('dynamoose');
      mockedDynamoose.model.mockImplementationOnce(jest.fn(() => ({
        batchPut: jest.fn((Municipality, err) => {
          err('foo');
        }),
      })));
      expect(() => require('./dynamoDB'))
        .toThrowError('Error populating mock Municipality data: foo');
    });
    */
    /*
    it('Should throw error if populating area test data fails.', () => {
      jest.doMock('./config', () => ({
        POPULATE_MOCK_DATA: true,
      }));
      const mockedDynamoose = require('dynamoose');
      mockedDynamoose.model.mockImplementationOnce(jest.fn(() => ({
        batchPut: jest.fn(),
      })));
      mockedDynamoose.model.mockImplementationOnce(jest.fn(() => ({
        batchPut: jest.fn((Municipality, err) => {
          err('foo');
        }),
      })));
      expect(() => require('./dynamoDB'))
        .toThrowError('Error populating mock Area data: foo');
    });
    */
  });
});
