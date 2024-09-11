import { register, login, logout, me, refresh } from '../src/controllers/auth/authController.js';
import User from '../src/models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

jest.mock('../src/models/User.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    
    describe('register', () => {
        it('should register a new user', async () => {
            User.findOne.mockResolvedValue(null); // Mock that no user exists with this email
            User.prototype.save = jest.fn().mockResolvedValue(true); // Mock save function

            const req = {
                body: {
                    email: 'testuser@example.com',
                    password: 'password123'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'User registered successfully'
            }));
        });

        it('should not register a user with an existing email', async () => {
            User.findOne.mockResolvedValue(true); // Mock that user exists

            const req = {
                body: {
                    email: 'testuser@example.com',
                    password: 'password123'
                }
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await register(req, res);

            expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already exists' });
        });
    });

    describe('login', () => {
        let findOneSpy, compareSpy, signSpy;
    
        beforeEach(() => {
            findOneSpy = jest.spyOn(User, 'findOne');
            signSpy = jest.spyOn(jwt, 'sign');
        });
    
        afterEach(() => {
            findOneSpy.mockRestore();
            signSpy.mockRestore();
        });
    
        it('should log in a user with valid credentials', async () => {
            const mockUser = {
                _id: "0",
                email: 'testuser@example.com',
                password: 'password123',
                comparePassword: jest.fn().mockResolvedValue(true), // Mock comparePassword
            };
    
            findOneSpy.mockResolvedValue(mockUser);
            mockUser.comparePassword.mockResolvedValue(true); // Simulate password match
            signSpy.mockReturnValue('mockToken'); // Mock token generation
    
            const req = {
                body: {
                    email: 'testuser@example.com',
                    password: 'password123',
                },
            };
    
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
    
            await login(req, res);
    
            expect(findOneSpy).toHaveBeenCalledWith({ email: req.body.email });
            expect(mockUser.comparePassword).toHaveBeenCalledWith(mockUser.password);
            expect(signSpy).toHaveBeenCalledTimes(2); // Token and refresh token
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login successful',
                token: 'mockToken',
                refresh_token: 'mockToken',
            });
        });
    
        it('should not log in a user with invalid credentials', async () => {
            findOneSpy.mockResolvedValue(null); // No user found
    
            const req = {
                body: {
                    email: 'wrong@example.com',
                    password: 'password123',
                },
            };
    
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
    
            await login(req, res);
    
            expect(findOneSpy).toHaveBeenCalledWith({ email: req.body.email });
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid email or password' });
        });
    });

    describe('logout', () => {
        it('should log out a user', async () => {
            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await logout(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'Logout successful' });
        });
    });

    describe('me', () => {
        let req, res;
    
        beforeEach(() => {
            req = {};
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
        });
    
        it('should return 404 if user is not found', async () => {
            req.user = null; // Simulating that no user is set by middleware
    
            await me(req, res);
    
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    
        it('should return user data if user is found', async () => {
            // Mock user object with a serializeData function
            const mockUser = {
                //...other fields
                serializeData: jest.fn().mockReturnValue({ email: 'user@example.com' }),
            };
    
            req.user = mockUser;
    
            await me(req, res);
    
            expect(res.status).toHaveBeenCalledWith(200);
            expect(mockUser.serializeData).toHaveBeenCalled(); // Verify that serializeData was called
            expect(res.json).toHaveBeenCalledWith({ email: 'user@example.com' });
        });
    
        it('should handle server error', async () => {
            req.user = { serializeData: jest.fn(() => { throw new Error('Some error'); }) }; // Simulating an error in serializeData
    
            await me(req, res);
    
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Server error', error: 'Some error' });
        });
    });
    

    describe('refresh', () => {
        it('should refresh the JWT token', async () => {
            jwt.verify.mockReturnValue({ id: '123' });
            jwt.sign.mockReturnValue('newMockToken');

            const req = {
                headers: { authorization: 'Bearer mockRefreshToken' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await refresh(req, res);

            expect(jwt.verify).toHaveBeenCalledWith('mockRefreshToken', expect.any(String));
            expect(jwt.sign).toHaveBeenCalledWith({ id: '123' }, expect.any(String), { expiresIn: expect.any(String) });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                token: 'newMockToken',
                refresh_token: 'mockRefreshToken'
            });
        });

        it('should return 403 if refresh token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            const req = {
                headers: { authorization: 'Bearer invalidRefreshToken' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await refresh(req, res);

            expect(jwt.verify).toHaveBeenCalledWith('invalidRefreshToken', expect.any(String));
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Invalid refresh token', error: expect.any(String) });
        });
    });
});
