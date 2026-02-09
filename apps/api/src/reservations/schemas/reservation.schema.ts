import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ReservationStatus } from '@repo/shared/dist/enums/reservation-status.enum';
import { HydratedDocument, Types } from 'mongoose';
import { Event } from 'src/events/schemas/event.schema';
import { User } from 'src/users/schemas/user.schema';

@Schema({ timestamps: true })
export class Reservation {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Event.name, required: true })
  event: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;
}

export type ReservationDocument = HydratedDocument<Reservation>;
export const ReservationSchema = SchemaFactory.createForClass(Reservation);
