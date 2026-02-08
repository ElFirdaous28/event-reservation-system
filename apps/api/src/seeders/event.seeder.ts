import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventStatus } from '@repo/shared';
import { EventDocument } from '../events/schemas/event.schema';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class EventSeeder {
  private readonly logger = new Logger(EventSeeder.name);

  constructor(
    @InjectModel('Event') private eventModel: Model<EventDocument>,
    @InjectModel('User') private userModel: Model<UserDocument>,
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
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'React Hooks Mastery',
        description: 'Master React hooks and build performant functional components.',
        location: 'Tech Conference Hall B',
        capacity: 40,
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'NestJS Best Practices',
        description: 'Learn best practices for building scalable NestJS applications.',
        location: 'Tech Conference Hall C',
        capacity: 35,
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
      {
        title: 'MongoDB for Developers',
        description: 'Complete guide to MongoDB including indexing, aggregation, and optimization.',
        location: 'Database Room 101',
        capacity: 30,
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        status: EventStatus.DRAFT,
        createdBy: adminUser._id,
      },
      {
        title: 'Web Security Essentials',
        description: 'Learn security best practices for modern web applications.',
        location: 'Security Lab 205',
        capacity: 25,
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: EventStatus.PUBLISHED,
        createdBy: adminUser._id,
      },
    ];

    for (const event of events) {
      await this.eventModel.create(event);
    }

    this.logger.log(`Total events seeded: ${events.length}`);
  }
}
