import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ReservationEntity, ReservationDocument } from './schemas/reservation.schema';
import { Model } from 'mongoose';
import { EventsService } from 'src/events/events.service';
import { EventStatus, ReservationStatus } from '@repo/shared';
import { ChangeReservationStatusDto } from './dto/change-reservation-status.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel(ReservationEntity.name) private reservationModel: Model<ReservationDocument>,
    private eventsService: EventsService,
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string): Promise<ReservationDocument> {
    const event = await this.eventsService.findOne(createReservationDto.eventId);

    // Check if event is published
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException('Cannot reserve unpublished or cancelled event');
    }

    // Check if user already has an active reservation for this event
    const existingReservation = await this.reservationModel.findOne({
      user: userId,
      event: createReservationDto.eventId,
      status: { $in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    });

    if (existingReservation) {
      throw new BadRequestException('You already have an active reservation for this event');
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

  async findAll(userId?: string, isAdmin: boolean = false): Promise<ReservationDocument[]> {
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

  async changeStatus(
    id: string,
    changeStatusDto: ChangeReservationStatusDto,
    userId: string,
    isAdmin: boolean,
  ): Promise<ReservationDocument> {
    const reservation = await this.findOne(id);

    // Participants can only cancel their own reservations
    if (!isAdmin) {
      if (reservation.user.toString() !== userId) {
        throw new ForbiddenException('You can only manage your own reservations');
      }
      if (changeStatusDto.status !== ReservationStatus.CANCELED) {
        throw new ForbiddenException('Participants can only cancel reservations');
      }
    }

    // Admin can change to any status
    reservation.status = changeStatusDto.status;
    return reservation.save();
  }

  async remove(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const reservation = await this.findOne(id);

    // Only admin or owner can delete
    if (!isAdmin && reservation.user.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own reservations');
    }

    await this.reservationModel.findByIdAndDelete(id).exec();
  }
}
