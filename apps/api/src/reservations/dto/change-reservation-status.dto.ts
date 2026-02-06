import { IsEnum } from 'class-validator';
import { ReservationStatus } from '@repo/shared';

export class ChangeReservationStatusDto {
    @IsEnum(ReservationStatus)
    status: ReservationStatus;
}
