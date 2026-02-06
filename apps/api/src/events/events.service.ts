import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectModel } from '@nestjs/mongoose';
import { EventEntity, EventDocument } from './schemas/event.schema';
import { Model } from 'mongoose';
import { EventStatus } from '@repo/shared';
import { ChangeEventStatusDto } from './dto/change-event-status.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(EventEntity.name) private eventModel: Model<EventDocument>,
  ) {}

  async create(createEventDto: CreateEventDto, userId: string): Promise<EventDocument> {
    const newEvent = new this.eventModel({
      ...createEventDto,
      createdBy: userId,
      status: EventStatus.DRAFT,
    });
    return newEvent.save();
  }

  async findAll(filters?: { 
    status?: EventStatus;
    search?: string;
    page?: number;
    limit?: number;
  }, isAdmin: boolean = false): Promise<{ events: EventDocument[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    // Non-admin users can only see published events
    if (!isAdmin) {
      query.status = EventStatus.PUBLISHED;
    } else if (filters?.status) {
      query.status = filters.status;
    }

    // Search filter (title, description, location)
    if (filters?.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { location: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [events, total] = await Promise.all([
      this.eventModel
        .find(query)
        .populate('createdBy', 'fullName email')
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.eventModel.countDocuments(query).exec(),
    ]);

    return {
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(id).populate('createdBy', 'fullName email').exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, userId: string): Promise<EventDocument> {
    const event = await this.findOne(id);
    
    // Check if user is the creator
    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only update events you created');
    }

    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .populate('createdBy', 'fullName email')
      .exec();
    
    return updatedEvent;
  }

  async changeStatus(id: string, changeStatusDto: ChangeEventStatusDto, userId: string): Promise<EventDocument> {
    const event = await this.findOne(id);
    
    // Check if user is the creator
    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only change status of events you created');
    }

    event.status = changeStatusDto.status;
    return event.save();
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.findOne(id);
    
    // Check if user is the creator
    if (event.createdBy.toString() !== userId) {
      throw new ForbiddenException('You can only delete events you created');
    }

    await this.eventModel.findByIdAndDelete(id).exec();
  }
}
