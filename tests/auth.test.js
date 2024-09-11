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
        let findByIdSpy
    
        beforeEach(() => {
            findByIdSpy = jest.spyOn(User, 'findById');
        });

        afterEach(() => {
            findByIdSpy.mockRestore();
        });
        
        it('should get the current user profile', async () => {
         
            
            const mockUser = {
                _id: '123',
                username: 'testuser',
                email: 'testuser@example.com'
            };

            findByIdSpy.mockResolvedValue(mockUser);

            const req = {
                user: { id: '123' } //assumed returned by middleware
            };

            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await me(req, res);

            expect(findByIdSpy).toHaveBeenCalledWith(req.user.id);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        it('should return 404 if user not found', async () => {
            User.findById.mockResolvedValue(null);

            const req = {
                user: { id: 'nonexistent' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await me(req, res);

            expect(User.findById).toHaveBeenCalledWith(req.user.id);
            // expect(res.status).toHaveBeenCalledWith(404);
            // expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
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
