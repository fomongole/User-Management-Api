import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from '../src/app.js';
import User from '../src/models/User.js';

// 2. Load env vars immediately
dotenv.config();

// 1. Connect to a TEST Database before running tests
beforeAll(async () => {
  // It's good practice to wait for the connection to be fully established
  await mongoose.connect(process.env.MONGO_URI);
});

// 2. Cleanup: Delete the test user after we are done
afterAll(async () => {
  // We explicitly close the connection to stop the test from "hanging"
  await User.deleteOne({ email: 'test@example.com' });
  await mongoose.connection.close();
});

describe('POST /api/auth/register', () => {
  // ... (Your tests stay exactly the same)
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    // We expect a 200 "Success" (Email Sent)
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });

  it('should not register a user with duplicate email', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User 2',
      email: 'test@example.com', // Duplicate email
      password: 'password123',
    });

    expect(res.statusCode).toEqual(400); // Bad Request
  });
});