import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReservationStatus } from '@repo/shared';
import { ReservationDocument } from '../reservations/schemas/reservation.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { EventDocument } from '../events/schemas/event.schema';

@Injectable()
export class ReservationSeeder {
  private readonly logger = new Logger(ReservationSeeder.name);

  constructor(
    @InjectModel('Reservation')
    private reservationModel: Model<ReservationDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Event') private eventModel: Model<EventDocument>,
  ) {}

  async seed() {
    const count = await this.reservationModel.countDocuments();

    if (count > 0) {
      this.logger.log('Reservations already exist, skipping...');
      return;
    }

    // Get users
    const jane = await this.userModel.findOne({ email: 'jane@example.com' });
    const john = await this.userModel.findOne({ email: 'john@example.com' });
    const alice = await this.userModel.findOne({ email: 'alice@example.com' });
    const bob = await this.userModel.findOne({ email: 'bob@example.com' });

    // Get events
    const events = await this.eventModel.find({}).limit(3);

    if (!jane || !john || !alice || !bob || events.length === 0) {
      this.logger.error(
        'Users or events not found. Run user and event seeders first.',
      );
      return;
    }

    const reservations = [
      {
        user: jane._id,
        event: events[0]._id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        user: john._id,
        event: events[0]._id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        user: alice._id,
        event: events[1]._id,
        status: ReservationStatus.PENDING,
      },
      {
        user: bob._id,
        event: events[1]._id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        user: jane._id,
        event: events[2]._id,
        status: ReservationStatus.CONFIRMED,
      },
      {
        user: john._id,
        event: events[2]._id,
        status: ReservationStatus.REFUSED,
      },
    ];

    for (const reservation of reservations) {
      await this.reservationModel.create(reservation);
      this.logger.log(
        `Created reservation: user ${reservation.user.toString()} for event ${reservation.event.toString()}`,
      );
    }

    this.logger.log(`Total reservations seeded: ${reservations.length}`);
  }
}
