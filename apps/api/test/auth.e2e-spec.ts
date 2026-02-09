import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import cookieParser from 'cookie-parser';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Auth E2E', () => {
    let app: INestApplication;
    let connection: Connection;
    const makeUser = () => {
        const id = Date.now().toString();
        return {
            email: `test-${id}@example.com`,
            password: 'Password123!',
            fullName: 'Test User',
        };
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
            }),
        );

        app.use(cookieParser());

        await app.init();

        connection = app.get(getConnectionToken());
    });

    afterEach(async () => {
        const collections = connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    });

    afterAll(async () => {
        await connection.close();
        await app.close();
    });

    it('should register a new user', async () => {
        const user = makeUser();
        return request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('message', 'Registration successful');
            });
    });

    it('should login and return access token', async () => {
        const user = makeUser();
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        return request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: user.password,
            })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('accessToken');
                expect(res.body).toHaveProperty('message', 'Login successful');
            });
    });

    it('should access protected route with JWT', async () => {
        const user = makeUser();
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        const loginRes = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: user.password,
            });

        const token = loginRes.body.accessToken;

        return request(app.getHttpServer())
            .get('/auth/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(user.email);
            });
    });

    it('should reject duplicate registration', async () => {
        const user = makeUser();
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(409);
    });

    it('should reject registration with invalid payload', async () => {
        await request(app.getHttpServer())
            .post('/auth/register')
            .send({
                email: 'not-an-email',
                password: '123',
                fullName: '',
            })
            .expect(400);
    });

    it('should reject login with invalid credentials', async () => {
        const user = makeUser();
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(user)
            .expect(201);

        await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: user.email,
                password: 'WrongPassword123!',
            })
            .expect(401);
    });

    it('should reject login with missing fields', async () => {
        await request(app.getHttpServer())
            .post('/auth/login')
            .send({ email: 'missing@example.com' })
            .expect(401);
    });

    it('should reject access to protected route without token', async () => {
        await request(app.getHttpServer())
            .get('/auth/me')
            .expect(401);
    });

    it('should reject refresh without cookie', async () => {
        await request(app.getHttpServer())
            .post('/auth/refresh')
            .expect(401);
    });
});
