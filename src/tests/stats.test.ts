
jest.mock('../supabase', () => ({
  from: jest.fn(),
}));

import supabase from '../supabase';
import request from 'supertest';
import express from 'express';
import router from '../api/stats';

const app = express();
app.use(router);

describe('Stats Router', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  describe('GET /stats', () => {
    it('should fetch all stats and return them as JSON', async () => {
      const mockData = [{ id: 1, name: 'Test' }, { id: 2, name: 'Sample' }];
      const mockSelect = jest.fn().mockResolvedValue({ data: mockData });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app).get('/stats');

      expect(supabase.from).toHaveBeenCalledWith('log_stats');
      expect(mockSelect).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockData);
    });

    it('should handle errors and return a 500 status', async () => {
      const mockSelect = jest.fn().mockRejectedValue(new Error('DB error'));
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      // console.log("xxx")
      const res = await request(app).get('/stats');
      
      expect(supabase.from).toHaveBeenCalledWith('log_stats');
      expect(mockSelect).toHaveBeenCalled();
      expect(res.statusCode).toBe(500);
      // expect(res.body).toEqual({ error: 'An error occurred while fetching stats' });
    });
  });

  describe('GET /stats/:jobId', () => {
    it('should fetch stats for a specific jobId and return them as JSON', async () => {
      const mockData = [{ id: 1, file_id: '123', name: 'Job Data' }];
      const jobId = '123';

      const mockEq = jest.fn().mockResolvedValue({ data: mockData });
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app).get(`/stats/${jobId}`);

      expect(supabase.from).toHaveBeenCalledWith('log_stats');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('file_id', jobId);
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(mockData);
    });

    it('should handle errors and return a 500 status', async () => {
      const jobId = '123';

      const mockEq = jest.fn().mockRejectedValue(new Error('DB error'));
      const mockSelect = jest.fn().mockReturnValue({ eq: mockEq });
      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const res = await request(app).get(`/stats/${jobId}`);

      expect(supabase.from).toHaveBeenCalledWith('log_stats');
      expect(mockSelect).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('file_id', jobId);
      expect(res.statusCode).toBe(500);
      // expect(res.body).toEqual({ error: 'An error occurred while fetching stats' });
    });
  });
});
