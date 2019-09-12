describe('Create', () => {
  beforeEach(() => {
    jest.resetModules();
  });
  it('should return a promise', async () => {
    jest.doMock('libs/dynamoDB', () => ({
      Municipality: {
        create: jest.fn(),
        scan: jest.fn(() => ({
          eq: jest.fn(() => ({
            exec: jest.fn(),
          })),
        })),
      },
    }));
    jest.doMock('common/encryptionService', () => ({}));
    const { create } = require('./municipalityService');
    const actual = create('foo', {});
    expect(actual.constructor.name).toEqual('Promise');
    await expect(actual).resolves.toBeUndefined();
  });
  it('should encrypt mapCredentials if provided.', async () => {
    const input = {
      mapCredentials: {
        username: 'foo',
        password: 'bar',
      },
    };
    const encryptMockReturn = '{"iv":"wVO9sIiVciAeyQyyQoPLSg=="}';
    const encryptedInput = {
      password: { iv: 'wVO9sIiVciAeyQyyQoPLSg==' },
      username: { iv: 'wVO9sIiVciAeyQyyQoPLSg==' },
    };
    jest.doMock('libs/dynamoDB', () => ({
      Municipality: {
        create: jest.fn(),
        scan: jest.fn(() => ({
          eq: jest.fn(() => ({
            exec: jest.fn(),
          })),
        })),
      },
    }));
    jest.doMock('common/encryptionService', () => ({
      encryptString: jest.fn(),
    }));
    const { encryptString } = require('common/encryptionService');
    const { Municipality } = require('libs/dynamoDB');
    const { create } = require('./municipalityService');
    encryptString.mockReturnValue(encryptMockReturn);
    Municipality.scan().eq().exec.mockReturnValue([]);
    const actual = create('foo', input);
    expect(actual.constructor.name).toEqual('Promise');
    await expect(actual).resolves.toBeUndefined();
    expect(encryptString).toHaveBeenCalledTimes(2);
    expect(Municipality.create).toHaveBeenCalledTimes(1);
    expect(typeof Municipality.create.mock.calls[0][0].name).toEqual('string');
    expect(Municipality.create.mock.calls[0][0].mapCredentials).toEqual(encryptedInput);
    encryptString.mockClear();
    expect(create('foo', {}).constructor.name).toEqual('Promise');
    expect(encryptString).toHaveBeenCalledTimes(0);
  });
});
