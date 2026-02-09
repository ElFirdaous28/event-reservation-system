import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReservationsService } from './reservations.service';
import { EventsService } from 'src/events/events.service';
import { Reservation } from './schemas/reservation.schema';
import { Event } from 'src/events/schemas/event.schema';
import { EventStatus, ReservationStatus } from '@repo/shared';

const userId = new Types.ObjectId().toString();
const otherUserId = new Types.ObjectId().toString();
const eventId = new Types.ObjectId().toString();
const reservationId = new Types.ObjectId().toString();

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationModelMock: any;
  let eventModelMock: any;
  let eventsServiceMock: any;

  beforeEach(async () => {
    reservationModelMock = jest.fn();
    reservationModelMock.countDocuments = jest.fn();
    reservationModelMock.findOne = jest.fn();
    reservationModelMock.find = jest.fn();
    reservationModelMock.findById = jest.fn();
    reservationModelMock.findByIdAndDelete = jest.fn();

    eventModelMock = {
      updateOne: jest.fn(),
    };

    eventsServiceMock = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getModelToken(Reservation.name),
          useValue: reservationModelMock,
        },
        {
          provide: getModelToken(Event.name),
          useValue: eventModelMock,
        },
        {
          provide: EventsService,
          useValue: eventsServiceMock,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Reservation Creation Rules', () => {
    const createDto = { eventId };

    it('should create a reservation successfully', async () => {
      const publishedEvent = {
        _id: eventId,
        status: EventStatus.PUBLISHED,
        capacity: 10,
      } as any;

      const savedReservation = {
        _id: reservationId,
        user: userId,
        event: eventId,
        status: ReservationStatus.PENDING,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(publishedEvent);
      reservationModelMock.findOne.mockResolvedValue(null);
      reservationModelMock.countDocuments.mockResolvedValue(0);

      // Mock the constructor to return our saved reservation
      const mockSave = jest.fn().mockResolvedValue(savedReservation);
      const mockReservationInstance = {
        save: mockSave,
      };

      // When new this.reservationModel() is called, return the mock instance
      reservationModelMock.mockImplementation(() => mockReservationInstance);

      const result = await service.create(createDto as any, userId);

      expect(eventsServiceMock.findOne).toHaveBeenCalledWith(eventId);
      expect(reservationModelMock.findOne).toHaveBeenCalled();
      expect(reservationModelMock.countDocuments).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(savedReservation);
    });

    it('should reject reservation for unpublished event', async () => {
      const draftEvent = {
        _id: eventId,
        status: EventStatus.DRAFT,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(draftEvent);

      await expect(service.create(createDto as any, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject reservation for cancelled event', async () => {
      const canceledEvent = {
        _id: eventId,
        status: EventStatus.CANCELED,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(canceledEvent);

      await expect(service.create(createDto as any, userId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Duplicate Prevention', () => {
    const createDto = { eventId };

    it('should reject if user already has pending reservation', async () => {
      const publishedEvent = {
        _id: eventId,
        status: EventStatus.PUBLISHED,
        capacity: 10,
      } as any;

      const existingReservation = {
        _id: new Types.ObjectId().toString(),
        user: userId,
        status: ReservationStatus.PENDING,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(publishedEvent);
      reservationModelMock.findOne.mockResolvedValue(existingReservation);

      await expect(service.create(createDto as any, userId)).rejects.toThrow(
        'You already have an active reservation for this event',
      );
    });

    it('should reject if user already has confirmed reservation', async () => {
      const publishedEvent = {
        _id: eventId,
        status: EventStatus.PUBLISHED,
        capacity: 10,
      } as any;

      const existingReservation = {
        _id: new Types.ObjectId().toString(),
        user: userId,
        status: ReservationStatus.CONFIRMED,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(publishedEvent);
      reservationModelMock.findOne.mockResolvedValue(existingReservation);

      await expect(service.create(createDto as any, userId)).rejects.toThrow(
        'You already have an active reservation for this event',
      );
    });
  });

  describe('Capacity Management', () => {
    const createDto = { eventId };

    it('should reject when event is full', async () => {
      const publishedEvent = {
        _id: eventId,
        status: EventStatus.PUBLISHED,
        capacity: 5,
      } as any;

      eventsServiceMock.findOne.mockResolvedValue(publishedEvent);
      reservationModelMock.findOne.mockResolvedValue(null);
      reservationModelMock.countDocuments.mockResolvedValue(5);

      await expect(service.create(createDto as any, userId)).rejects.toThrow(
        'Event is full',
      );
    });
  });

  describe('Status Transitions', () => {
    const statusChangeDto = { status: ReservationStatus.CONFIRMED };

    it('should transition to confirmed and adjust availableSeats', async () => {
      const reservation = {
        _id: reservationId,
        user: { _id: new Types.ObjectId(userId) },
        event: { _id: new Types.ObjectId(eventId) },
        status: ReservationStatus.PENDING,
        save: jest.fn().mockResolvedValue(
          { status: ReservationStatus.CONFIRMED } as any,
        ),
      } as any;

      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(reservation);
      eventModelMock.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.changeStatus(
        reservationId,
        statusChangeDto as any,
        userId,
        true,
      );

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
      expect(eventModelMock.updateOne).toHaveBeenCalledWith(
        { _id: eventId },
        { $inc: { availableSeats: -1 } },
      );

      findOneSpy.mockRestore();
    });

    it('should prevent participant from changing to non-cancelled status', async () => {
      const reservation = {
        _id: reservationId,
        user: { _id: new Types.ObjectId(userId) },
        event: { _id: new Types.ObjectId(eventId) },
        status: ReservationStatus.CONFIRMED,
      } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(reservation);

      await expect(
        service.changeStatus(
          reservationId,
          { status: ReservationStatus.CONFIRMED } as any,
          userId,
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow participant to cancel own reservation', async () => {
      const reservation = {
        _id: reservationId,
        user: { _id: new Types.ObjectId(userId) },
        event: { _id: new Types.ObjectId(eventId) },
        status: ReservationStatus.CONFIRMED,
        save: jest
          .fn()
          .mockResolvedValue({ status: ReservationStatus.CANCELED } as any),
      } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(reservation);
      eventModelMock.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      const result = await service.changeStatus(
        reservationId,
        { status: ReservationStatus.CANCELED } as any,
        userId,
        false,
      );

      expect(result.status).toBe(ReservationStatus.CANCELED);
      expect(eventModelMock.updateOne).toHaveBeenCalledWith(
        { _id: eventId },
        { $inc: { availableSeats: 1 } },
      );
    });

    it('should prevent participant from cancelling someone else reservation', async () => {
      const reservation = {
        _id: reservationId,
        user: { _id: new Types.ObjectId(otherUserId) },
        event: { _id: new Types.ObjectId(eventId) },
        status: ReservationStatus.CONFIRMED,
      } as any;

      jest.spyOn(service, 'findOne').mockResolvedValue(reservation);

      await expect(
        service.changeStatus(
          reservationId,
          { status: ReservationStatus.CANCELED } as any,
          userId,
          false,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
