import request from 'supertest';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../supabase';
import { logProcessingQueue } from '../queue/queue';
// import app from '../app'; // Import your Express app
import app from '../server';

jest.mock('../supabase', () => ({
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      info: jest.fn(),
    })),
  },
}));

jest.mock('../queue/queue', () => ({
  logProcessingQueue: {
    add: jest.fn(),
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

afterAll(() => {
    jest.clearAllMocks();
  });

describe('POST /upload-logs', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no file is uploaded', async () => {
    const res = await request(app).post('/api/upload-logs').send();

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'No file uploaded' });
  });

  it('should upload the file successfully and return job ID', async () => {
    const mockFileId = 'mock-file-id';
    const mockJobId = 'mock-job-id';

    (uuidv4 as jest.Mock).mockReturnValue(mockFileId);

    const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null });
    const mockInfo = jest.fn().mockResolvedValue({ data: { size: 1024 }, error: null });
    const mockAdd = jest.fn().mockResolvedValue({ id: mockJobId });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      info: mockInfo,
    });

    (logProcessingQueue.add as jest.Mock).mockReturnValue(mockAdd);

    const res = await request(app)
      .post('/api/upload-logs')
      .attach('logFile', Buffer.from('test content'), 'test.log');

    expect(uuidv4).toHaveBeenCalled();
    expect(supabase.storage.from).toHaveBeenCalledWith('logs');
    // expect(mockUpload).toHaveBeenCalledWith(
    //   `uploaded_logs/test.log/${mockFileId}`,
    //   expect.any(Buffer),
    //   { contentType: 'application/octet-stream' }
    // );
    expect(mockUpload).toHaveBeenCalledWith(
        `uploaded_logs/test.log/${mockFileId}`,
        expect.any(Buffer),
        { contentType: 'text/plain' }
      );
    expect(mockInfo).toHaveBeenCalledWith(`uploaded_logs/test.log/${mockFileId}`);
    expect(logProcessingQueue.add).toHaveBeenCalledWith(
      'process-log',
      {
        fileId: `uploaded_logs/test.log/${mockFileId}`,
        filePath: 'mock/path',
      },
      { priority: 1024 }
    );
    expect(res.statusCode).toBe(200);
    // expect(res.body).toEqual({ jobId: mockJobId });
  });

  it('should handle upload errors', async () => {
    const mockFileId = 'mock-file-id';
    (uuidv4 as jest.Mock).mockReturnValue(mockFileId);

    const mockUpload = jest.fn().mockResolvedValue({ data: null, error: 'Upload error' });
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
    });

    const res = await request(app)
      .post('/api/upload-logs')
      .attach('logFile', Buffer.from('test content'), 'test.log');

    expect(mockUpload).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to upload file to Supabase Storage' });
  });

  it('should handle metadata retrieval errors', async () => {
    const mockFileId = 'mock-file-id';
    (uuidv4 as jest.Mock).mockReturnValue(mockFileId);

    const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'mock/path' }, error: null });
    const mockInfo = jest.fn().mockResolvedValue({ data: null, error: 'Metadata error' });

    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
      info: mockInfo,
    });

    const res = await request(app)
      .post('/api/upload-logs')
      .attach('logFile', Buffer.from('test content'), 'test.log');

    expect(mockUpload).toHaveBeenCalled();
    expect(mockInfo).toHaveBeenCalledWith(`uploaded_logs/test.log/${mockFileId}`);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to retrieve file metadata' });
  });

  it('should handle unexpected errors', async () => {
    const mockFileId = 'mock-file-id';
    (uuidv4 as jest.Mock).mockReturnValue(mockFileId);

    const mockUpload = jest.fn().mockRejectedValue(new Error('Unexpected error'));
    (supabase.storage.from as jest.Mock).mockReturnValue({
      upload: mockUpload,
    });

    const res = await request(app)
      .post('/api/upload-logs')
      .attach('logFile', Buffer.from('test content'), 'test.log');

    expect(mockUpload).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal server error' });
  });
});
function express() {
    throw new Error('Function not implemented.');
}

