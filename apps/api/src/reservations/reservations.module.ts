import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';
import { EventsModule } from 'src/events/events.module';
import { Event, EventSchema } from 'src/events/schemas/event.schema';
import { TicketGeneratorService } from './services/ticket-generator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Event.name, schema: EventSchema },
    ]),
    EventsModule,
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, TicketGeneratorService],
})
export class ReservationsModule {}
