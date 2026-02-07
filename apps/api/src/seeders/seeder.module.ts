import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeeder } from './database.seeder';
import { UserSeeder } from './user.seeder';
import { EventSeeder } from './event.seeder';
import { ReservationSeeder } from './reservation.seeder';
import { UserSchema } from '../users/schemas/user.schema';
import { EventSchema } from '../events/schemas/event.schema';
import { ReservationSchema } from '../reservations/schemas/reservation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Event', schema: EventSchema },
      { name: 'Reservation', schema: ReservationSchema },
    ]),
  ],
  providers: [DatabaseSeeder, UserSeeder, EventSeeder, ReservationSeeder],
  exports: [DatabaseSeeder],
})
export class SeederModule {}
