import { Injectable, Logger } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { EventSeeder } from './event.seeder';
import { ReservationSeeder } from './reservation.seeder';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly eventSeeder: EventSeeder,
    private readonly reservationSeeder: ReservationSeeder,
    @InjectModel('User') private userModel: Model<any>,
    @InjectModel('Event') private eventModel: Model<any>,
    @InjectModel('Reservation') private reservationModel: Model<any>,
  ) {}

  async seed() {
    try {
      this.logger.log('Starting database seeding...');

      // Seed in order of dependencies
      await this.userSeeder.seed();
      await this.eventSeeder.seed();
      await this.reservationSeeder.seed();

      this.logger.log('Database seeding completed successfully');
    } catch (error) {
      this.logger.error('Database seeding failed', error);
      throw error;
    }
  }

  async drop() {
    try {
      this.logger.log('Dropping database collections...');

      await this.reservationModel.deleteMany({});
      this.logger.log('Dropped reservations collection');

      await this.eventModel.deleteMany({});
      this.logger.log('Dropped events collection');

      await this.userModel.deleteMany({});
      this.logger.log('Dropped users collection');

      this.logger.log('Database drop completed successfully');
    } catch (error) {
      this.logger.error('Database drop failed', error);
      throw error;
    }
  }

  async reset() {
    try {
      this.logger.log('Resetting database...');

      await this.drop();
      await this.seed();

      this.logger.log('Database reset completed successfully');
    } catch (error) {
      this.logger.error('Database reset failed', error);
      throw error;
    }
  }
}
