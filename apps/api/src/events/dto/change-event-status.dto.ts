import { EventStatus } from '@repo/shared';
import { IsEnum } from 'class-validator';

export class ChangeEventStatusDto {
    @IsEnum(EventStatus)
    status: EventStatus;
}
