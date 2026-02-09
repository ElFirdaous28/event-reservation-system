import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { Connection } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { Role, EventStatus } from '@repo/shared';
import { User } from 'src/users/schemas/user.schema';

describe('Events E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let userModel: any;

  const makeAdminUser = () => {
    const id = Date.now().toString();
    return {
      email: `admin-${id}@example.com`,
      password: 'Password123!',
      fullName: 'Admin User',
    };
  };

  const makeEventDto = () => ({
    title: 'Lifecycle Event',
    description: 'Lifecycle description',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Test location',
    capacity: 50,
  });

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
    userModel = app.get(getModelToken(User.name));
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

  const createAdminAndLogin = async () => {
    const admin = makeAdminUser();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(admin)
      .expect(201);

    await userModel.updateOne({ email: admin.email }, { role: Role.ADMIN });

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: admin.email,
        password: admin.password,
      })
      .expect(201);

    return loginRes.body.accessToken as string;
  };

  it('should create, publish, and cancel an event', async () => {
    const token = await createAdminAndLogin();
    const eventData = makeEventDto();

    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send(eventData)
      .expect(201);

    const eventId = createRes.body._id || createRes.body.id;
    expect(eventId).toBeDefined();
    expect(createRes.body.status).toBe(EventStatus.DRAFT);

    const publishRes = await request(app.getHttpServer())
      .patch(`/events/${eventId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: EventStatus.PUBLISHED })
      .expect(200);

    expect(publishRes.body.status).toBe(EventStatus.PUBLISHED);

    const cancelRes = await request(app.getHttpServer())
      .patch(`/events/${eventId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: EventStatus.CANCELED })
      .expect(200);

    expect(cancelRes.body.status).toBe(EventStatus.CANCELED);
  });

  it('should reject event creation without auth', async () => {
    await request(app.getHttpServer())
      .post('/events')
      .send(makeEventDto())
      .expect(401);
  });

  it('should reject event creation by non-admin user', async () => {
    const user = makeAdminUser();

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send(makeEventDto())
      .expect(403);
  });

  it('should reject event creation with invalid payload', async () => {
    const token = await createAdminAndLogin();

    await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: '',
        date: 'not-a-date',
        location: '',
        capacity: 0,
      })
      .expect(400);
  });

  it('should reject status change without auth', async () => {
    await request(app.getHttpServer())
      .patch('/events/000000000000000000000000/status')
      .send({ status: EventStatus.PUBLISHED })
      .expect(401);
  });

  it('should reject status change by non-creator admin', async () => {
    const creatorToken = await createAdminAndLogin();
    const otherAdminToken = await createAdminAndLogin();

    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send(makeEventDto())
      .expect(201);

    const eventId = createRes.body._id || createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/events/${eventId}/status`)
      .set('Authorization', `Bearer ${otherAdminToken}`)
      .send({ status: EventStatus.PUBLISHED })
      .expect(403);
  });

  it('should reject status change with invalid status', async () => {
    const token = await createAdminAndLogin();
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${token}`)
      .send(makeEventDto())
      .expect(201);

    const eventId = createRes.body._id || createRes.body.id;

    await request(app.getHttpServer())
      .patch(`/events/${eventId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'INVALID_STATUS' })
      .expect(400);
  });
});
