import request from 'supertest';
import { logProcessingQueue } from '../queue/queue';
import app from '../server';

afterAll(() => {
    jest.clearAllMocks();
  });
  
jest.mock('../queue/queue', () => ({
  logProcessingQueue: {
    getJobCounts: jest.fn(),
  },
}));

describe('Queue Status Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /queue-status', () => {
    it('should fetch job counts from the queue and return them as JSON', async () => {
      const mockJobCounts = {
        waiting: 5,
        active: 3,
        completed: 10,
        failed: 2,
        delayed: 1,
      };
      (logProcessingQueue.getJobCounts as jest.Mock).mockResolvedValue(mockJobCounts);

      const res = await request(app).get('/api/queue-status'); 

      expect(logProcessingQueue.getJobCounts).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockJobCounts);
    });

    it('should handle errors and return a 500 status', async () => {
      (logProcessingQueue.getJobCounts as jest.Mock).mockRejectedValue(new Error('Queue error'));

      const res = await request(app).get('/api/queue-status');

      expect(logProcessingQueue.getJobCounts).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
    });
  });
});
