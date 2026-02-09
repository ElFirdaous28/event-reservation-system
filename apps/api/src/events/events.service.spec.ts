import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventsService } from './events.service';
import { Event } from './schemas/event.schema';
import { EventStatus } from '@repo/shared';

const userId = new Types.ObjectId().toString();
const otherUserId = new Types.ObjectId().toString();

const makeCreateDto = () => ({
  title: 'Test Event',
  description: 'Test description',
  date: new Date().toISOString(),
  location: 'Test location',
  capacity: 100,
});

describe('EventsService', () => {
  let service: EventsService;
  let eventModelMock: any;

  beforeEach(async () => {
    const mockConstructor: any = jest.fn();
    mockConstructor.findById = jest.fn();
    mockConstructor.findByIdAndUpdate = jest.fn();
    mockConstructor.findByIdAndDelete = jest.fn();

    eventModelMock = mockConstructor;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken(Event.name),
          useValue: eventModelMock,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should set availableSeats to capacity when not provided', async () => {
      const createDto = makeCreateDto();
      const saved = { _id: new Types.ObjectId(), ...createDto } as any;

      const save = jest.fn().mockResolvedValue(saved);
      eventModelMock.mockImplementation((data: any) => ({ ...data, save }));

      const result = await service.create(createDto as any, userId);

      expect(eventModelMock).toHaveBeenCalledTimes(1);
      const callArg = eventModelMock.mock.calls[0][0];
      expect(callArg.availableSeats).toBe(createDto.capacity);
      expect(callArg.status).toBe(EventStatus.DRAFT);
      expect(callArg.createdBy).toBeInstanceOf(Types.ObjectId);
      expect(callArg.createdBy.toString()).toBe(userId);
      expect(save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(saved);
    });

    it('should use provided availableSeats', async () => {
      const createDto = { ...makeCreateDto(), availableSeats: 50 };
      const saved = { _id: new Types.ObjectId(), ...createDto } as any;

      const save = jest.fn().mockResolvedValue(saved);
      eventModelMock.mockImplementation((data: any) => ({ ...data, save }));

      const result = await service.create(createDto as any, userId);

      const callArg = eventModelMock.mock.calls[0][0];
      expect(callArg.availableSeats).toBe(50);
      expect(result).toEqual(saved);
    });
  });

  describe('update', () => {
    it('should update when user is the creator', async () => {
      const eventId = new Types.ObjectId().toString();
      const existing = {
        _id: eventId,
        createdBy: { _id: new Types.ObjectId(userId) },
      } as any;
      const updated = { _id: eventId, title: 'Updated' } as any;

      eventModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existing),
      });
      eventModelMock.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(updated),
      });

      const result = await service.update(
        eventId,
        { title: 'Updated' } as any,
        userId,
      );

      expect(eventModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        eventId,
        { title: 'Updated' },
        { new: true },
      );
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const eventId = new Types.ObjectId().toString();
      const existing = {
        _id: eventId,
        createdBy: { _id: new Types.ObjectId(otherUserId) },
      } as any;

      eventModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existing),
      });

      await expect(
        service.update(eventId, { title: 'Updated' } as any, userId),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(eventModelMock.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when updated event is missing', async () => {
      const eventId = new Types.ObjectId().toString();
      const existing = {
        _id: eventId,
        createdBy: { _id: new Types.ObjectId(userId) },
      } as any;

      eventModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existing),
      });
      eventModelMock.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(eventId, { title: 'Updated' } as any, userId),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('changeStatus', () => {
    it('should update status when user is the creator', async () => {
      const eventId = new Types.ObjectId().toString();
      const saved = { _id: eventId, status: EventStatus.PUBLISHED } as any;
      const existing = {
        _id: eventId,
        createdBy: { _id: new Types.ObjectId(userId) },
        status: EventStatus.DRAFT,
        save: jest.fn().mockResolvedValue(saved),
      } as any;

      eventModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existing),
      });

      const result = await service.changeStatus(
        eventId,
        { status: EventStatus.PUBLISHED } as any,
        userId,
      );

      expect(existing.status).toBe(EventStatus.PUBLISHED);
      expect(existing.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(saved);
    });

    it('should throw ForbiddenException when user is not creator', async () => {
      const eventId = new Types.ObjectId().toString();
      const existing = {
        _id: eventId,
        createdBy: { _id: new Types.ObjectId(otherUserId) },
        status: EventStatus.DRAFT,
        save: jest.fn(),
      } as any;

      eventModelMock.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(existing),
      });

      await expect(
        service.changeStatus(
          eventId,
          { status: EventStatus.PUBLISHED } as any,
          userId,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);

      expect(existing.save).not.toHaveBeenCalled();
    });
  });
});
