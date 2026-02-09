import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { Connection } from 'mongoose';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { Role, EventStatus, ReservationStatus } from '@repo/shared';
import { User } from 'src/users/schemas/user.schema';

describe('Reservations E2E', () => {
  let app: INestApplication;
  let connection: Connection;
  let userModel: any;
  let userCounter = 0;

  const makeUser = (prefix: string) => {
    userCounter++;
    const uniqueId = `${Date.now()}-${userCounter}-${Math.random().toString(36).substr(2, 9)}`;
    return {
      email: `${prefix}-${uniqueId}@example.com`,
      password: 'Password123!',
      fullName: `${prefix} User`,
    };
  };

  const makeEventDto = () => ({
    title: 'Reservation Test Event',
    description: 'Test event for reservations',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: 'Test location',
    capacity: 5,
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
    const admin = makeUser('admin');

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

  const createParticipantAndLogin = async () => {
    const participant = makeUser('participant');

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(participant)
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: participant.email,
        password: participant.password,
      })
      .expect(201);

    return loginRes.body.accessToken as string;
  };

  describe('Full Reservation Lifecycle', () => {
    it('should complete full flow: reserve → confirm → cancel', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      // Admin creates and publishes event
      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      const publishRes = await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      expect(publishRes.body.status).toBe(EventStatus.PUBLISHED);

      // Participant reserves event
      const reserveRes = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201);

      const reservationId = reserveRes.body._id || reserveRes.body.id;
      expect(reserveRes.body.status).toBe(ReservationStatus.PENDING);

      // Admin confirms reservation
      const confirmRes = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ReservationStatus.CONFIRMED })
        .expect(200);

      expect(confirmRes.body.status).toBe(ReservationStatus.CONFIRMED);

      // Participant cancels reservation
      const cancelRes = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ status: ReservationStatus.CANCELED })
        .expect(200);

      expect(cancelRes.body.status).toBe(ReservationStatus.CANCELED);
    });

    it('should complete full flow: reserve → refuse → create new', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      // Admin creates and publishes event
      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      // Participant reserves event
      const reserveRes = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201);

      const reservationId = reserveRes.body._id || reserveRes.body.id;

      // Admin refuses reservation
      const refuseRes = await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: ReservationStatus.REFUSED })
        .expect(200);

      expect(refuseRes.body.status).toBe(ReservationStatus.REFUSED);

      // Participant can create new reservation after refusal
      const newReserveRes = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201);

      expect(newReserveRes.body.status).toBe(ReservationStatus.PENDING);
    });
  });

  describe('Reservation Restrictions', () => {
    it('should reject duplicate active reservations', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      // First reservation
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201);

      // Second reservation should fail
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(400);
    });

    it('should reject reservation for unpublished event', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      // Event is in DRAFT, not published
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(400);
    });

    it('should reject reservation when event is full', async () => {
      const adminToken = await createAdminAndLogin();

      // Create 3 participants sequentially to ensure unique emails
      const participant1 = await createParticipantAndLogin();
      const participant2 = await createParticipantAndLogin();
      const participant3 = await createParticipantAndLogin();

      // Create small event (2 capacity)
      const eventData = { ...makeEventDto(), capacity: 2 };
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      // First two participants reserve successfully
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participant1}`)
        .send({ eventId })
        .expect(201);

      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participant2}`)
        .send({ eventId })
        .expect(201);

      // Third participant should be rejected (event full)
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participant3}`)
        .send({ eventId })
        .expect(400);
    });

    it('should reject reservation for cancelled event', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      // Cancel the event
      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.CANCELED })
        .expect(200);

      // Reservation should fail
      await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(400);
    });
  });

  describe('Role-based Access Control', () => {
    it('should reject participant from changing status to non-cancelled', async () => {
      const adminToken = await createAdminAndLogin();
      const participantToken = await createParticipantAndLogin();

      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      const reserveRes = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ eventId })
        .expect(201);

      const reservationId = reserveRes.body._id || reserveRes.body.id;

      // Participant tries to confirm (should fail)
      await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${participantToken}`)
        .send({ status: ReservationStatus.CONFIRMED })
        .expect(403);
    });

    it('should reject participant from managing others reservations', async () => {
      const adminToken = await createAdminAndLogin();
      const participant1Token = await createParticipantAndLogin();
      const participant2Token = await createParticipantAndLogin();

      const eventData = makeEventDto();
      const createEventRes = await request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(eventData)
        .expect(201);

      const eventId = createEventRes.body._id || createEventRes.body.id;

      await request(app.getHttpServer())
        .patch(`/events/${eventId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: EventStatus.PUBLISHED })
        .expect(200);

      const reserveRes = await request(app.getHttpServer())
        .post('/reservations')
        .set('Authorization', `Bearer ${participant1Token}`)
        .send({ eventId })
        .expect(201);

      const reservationId = reserveRes.body._id || reserveRes.body.id;

      // Participant2 tries to cancel participant1's reservation (should fail)
      await request(app.getHttpServer())
        .patch(`/reservations/${reservationId}/status`)
        .set('Authorization', `Bearer ${participant2Token}`)
        .send({ status: ReservationStatus.CANCELED })
        .expect(403);
    });
  });
});
