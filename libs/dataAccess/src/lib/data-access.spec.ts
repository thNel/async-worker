import axios from 'axios';
import DataAccess from './data-access';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DataAccess', () => {
  beforeEach(() => {
    mockedAxios.create.mockReturnValue(mockedAxios);
  });

  it('should reject with message when request fails', async () => {
    mockedAxios.get.mockRejectedValue(new Error('fail'));
    const logSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(DataAccess.getAllJobs()).rejects.toBe('fail');
    expect(logSpy).toHaveBeenCalledWith('DataAccess error', new Error('fail'));
    logSpy.mockRestore();
  });
});
