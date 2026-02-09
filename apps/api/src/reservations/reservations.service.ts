import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';
import { Model } from 'mongoose';
import { EventsService } from 'src/events/events.service';
import { EventStatus, ReservationStatus } from '@repo/shared';
import { ChangeReservationStatusDto } from './dto/change-reservation-status.dto';
import { Event, EventDocument } from 'src/events/schemas/event.schema';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private reservationModel: Model<ReservationDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private eventsService: EventsService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
    userId: string,
  ): Promise<ReservationDocument> {
    const event = await this.eventsService.findOne(
      createReservationDto.eventId,
    );

    // Check if event is published
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(
        'Cannot reserve unpublished or cancelled event',
      );
    }

    // Check if user already has an active reservation for this event
    const existingReservation = await this.reservationModel.findOne({
      user: userId,
      event: createReservationDto.eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    if (existingReservation) {
      throw new BadRequestException(
        'You already have an active reservation for this event',
      );
    }

    // Check event capacity
    const reservationCount = await this.reservationModel.countDocuments({
      event: createReservationDto.eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    if (reservationCount >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    const newReservation = new this.reservationModel({
      user: userId,
      event: createReservationDto.eventId,
      status: ReservationStatus.PENDING,
    });

    return newReservation.save();
  }

  async findAll(
    userId?: string,
    isAdmin: boolean = false,
  ): Promise<ReservationDocument[]> {
    const query = !isAdmin && userId ? { user: userId } : {};
    return this.reservationModel
      .find(query)
      .populate('user', 'fullName email')
      .populate('event', 'title date location status')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<ReservationDocument> {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('user', 'fullName email')
      .populate('event', 'title date location status capacity')
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async findByEvent(
    eventId: string,
    isAdmin: boolean,
  ): Promise<ReservationDocument[]> {
    // Verify event exists
    await this.eventsService.findOne(eventId);

    const query: any = { event: eventId };

    // Non-admin users only see confirmed reservations
    if (!isAdmin) {
      query.status = ReservationStatus.CONFIRMED;
    }

    return this.reservationModel
      .find(query)
      .populate('user', 'fullName email')
      .populate('event', 'title date location status capacity')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string): Promise<ReservationDocument[]> {
    return this.reservationModel
      .find({ user: userId })
      .populate('event', 'title date location status capacity')
      .sort({ createdAt: -1 })
      .exec();
  }

  async changeStatus(
    id: string,
    changeStatusDto: ChangeReservationStatusDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<ReservationDocument> {
    const reservation = await this.findOne(id);
    const oldStatus = reservation.status;
    const newStatus = changeStatusDto.status;

    // Participants can only cancel their own reservations
    if (!isAdmin) {
      if (reservation.user._id.toString() !== userId) {
        throw new ForbiddenException(
          'You can only manage your own reservations',
        );
      }
      if (changeStatusDto.status !== ReservationStatus.CANCELED) {
        throw new ForbiddenException(
          'Participants can only cancel reservations',
        );
      }
    }

    // Update availableSeats based on status change
    const eventId = reservation.event._id.toString();
    let seatsAdjustment = 0;

    // If changing FROM CONFIRMED, increase availableSeats
    if (
      oldStatus === ReservationStatus.CONFIRMED &&
      newStatus !== ReservationStatus.CONFIRMED
    ) {
      seatsAdjustment = 1;
    }
    // If changing TO CONFIRMED from another status, decrease availableSeats
    else if (
      oldStatus !== ReservationStatus.CONFIRMED &&
      newStatus === ReservationStatus.CONFIRMED
    ) {
      seatsAdjustment = -1;
    }

    if (seatsAdjustment !== 0) {
      await this.eventModel
        .updateOne(
          { _id: eventId },
          { $inc: { availableSeats: seatsAdjustment } },
        )
        .exec();
    }

    // Admin can change to any status
    reservation.status = newStatus;
    return reservation.save();
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const reservation = await this.findOne(id);

    // Only admin or owner can delete
    if (!isAdmin && reservation.user._id.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reservations');
    }

    await this.reservationModel.findByIdAndDelete(id).exec();
  }

  async getStats() {
    const total = await this.reservationModel.countDocuments().exec();
    const pending = await this.reservationModel
      .countDocuments({ status: ReservationStatus.PENDING })
      .exec();
    const confirmed = await this.reservationModel
      .countDocuments({ status: ReservationStatus.CONFIRMED })
      .exec();
    const refused = await this.reservationModel
      .countDocuments({ status: ReservationStatus.REFUSED })
      .exec();
    const canceled = await this.reservationModel
      .countDocuments({ status: ReservationStatus.CANCELED })
      .exec();

    return {
      total,
      pending,
      confirmed,
      refused,
      canceled,
    };
  }
}
