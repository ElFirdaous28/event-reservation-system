import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;
}
