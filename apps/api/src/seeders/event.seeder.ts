import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStatus, ReservationStatus } from '@repo/shared';
import { EventDocument } from '../events/schemas/event.schema';
import { UserDocument } from '../users/schemas/user.schema';
import { ReservationDocument } from '../reservations/schemas/reservation.schema';

@Injectable()
export class EventSeeder {
  private readonly logger = new Logger(EventSeeder.name);

  constructor(
    @InjectModel('Event') private eventModel: Model<EventDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
    @InjectModel('Reservation') private reservationModel: Model<ReservationDocument>,
  ) {}

  async seed() {
    const count = await this.eventModel.countDocuments();

    if (count > 0) {
      this.logger.log('Events already exist, skipping...');
      return;
    }

    // Get admin user
    const adminUser = await this.userModel.findOne({ email: 'admin@example.com' });

    if (!adminUser) {
      this.logger.error('Admin user not found. Run user seeder first.');
      return;
    }

    const events = [
      {
        title: 'TypeScript Advanced Workshop',
        description: 'Deep dive into TypeScript advanced features including generics, decorators, and more.',
        location: 'Tech Conference Hall A',
        capacity: 50,
        availableSeats: 50,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'React Hooks Mastery',
        description: 'Master React hooks and build performant functional components.',
        location: 'Tech Conference Hall B',
        capacity: 40,
        availableSeats: 40,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'NestJS Best Practices',
        description: 'Learn best practices for building scalable NestJS applications.',
        location: 'Tech Conference Hall C',
        capacity: 35,
        availableSeats: 35,
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'MongoDB for Developers',
        description: 'Complete guide to MongoDB including indexing, aggregation, and optimization.',
        location: 'Database Room 101',
        capacity: 30,
        availableSeats: 30,
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: EventStatus.DRAFT,
        createdBy: adminUser._id,
      },
      {
        title: 'Web Security Essentials',
        description: 'Learn security best practices for modern web applications.',
        location: 'Security Lab 205',
        capacity: 25,
        availableSeats: 25,
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
    ];

    for (const event of events) {
      await this.eventModel.create(event);
    }

    // Create sample reservations to demonstrate availableSeats
    const participants = await this.userModel.find({ email: { $ne: 'admin@example.com' } }).limit(15);

    if (participants.length > 0) {
      const createdEvents = await this.eventModel.find({ title: { $in: events.map((e) => e.title) } });

      // First event: 10 confirmed reservations (50 - 10 = 40 available)
      if (createdEvents[0]) {
        for (let i = 0; i < Math.min(10, participants.length); i++) {
          const reservation = await this.reservationModel.create({
            event: createdEvents[0]._id,
            user: participants[i]._id,
            status: ReservationStatus.CONFIRMED,
          });
          // Decrease availableSeats
          await this.eventModel.updateOne(
            { _id: createdEvents[0]._id },
            { $inc: { availableSeats: -1 } },
          );
        }
      }

      // Second event: 35 confirmed reservations (40 - 35 = 5 available)
      if (createdEvents[1] && participants.length >= 10) {
        for (let i = 0; i < Math.min(35, participants.length); i++) {
          const participantIndex = i % participants.length;
          const existing = await this.reservationModel.findOne({
            event: createdEvents[1]._id,
            user: participants[participantIndex]._id,
          });
          if (!existing) {
            await this.reservationModel.create({
              event: createdEvents[1]._id,
              user: participants[participantIndex]._id,
              status: ReservationStatus.CONFIRMED,
            });
            // Decrease availableSeats
            await this.eventModel.updateOne(
              { _id: createdEvents[1]._id },
              { $inc: { availableSeats: -1 } },
            );
          }
        }
      }

      // Third event: 20 confirmed reservations (35 - 20 = 15 available)
      if (createdEvents[2] && participants.length >= 10) {
        for (let i = 0; i < Math.min(20, participants.length); i++) {
          const participantIndex = i % participants.length;
          const existing = await this.reservationModel.findOne({
            event: createdEvents[2]._id,
            user: participants[participantIndex]._id,
          });
          if (!existing) {
            await this.reservationModel.create({
              event: createdEvents[2]._id,
              user: participants[participantIndex]._id,
              status: ReservationStatus.CONFIRMED,
            });
            // Decrease availableSeats
            await this.eventModel.updateOne(
              { _id: createdEvents[2]._id },
              { $inc: { availableSeats: -1 } },
            );
          }
        }
      }
    }

    this.logger.log(`Total events seeded: ${events.length}`);
  }
}
