import request from 'supertest';
import app from '../src/app';

let server;

beforeAll(() => {
  server = app.listen(3000);
});

afterAll(() => {
  server.close();
});

describe('GET /', () => {
  it('should return Hello World', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World!');
  });
});
