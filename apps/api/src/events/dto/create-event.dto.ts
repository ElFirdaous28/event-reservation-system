import { IsNotEmpty, IsString, IsNumber, Min, IsDateString, IsOptional } from 'class-validator';

export class CreateEventDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    description?: string;

    @IsDateString()
    date: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNumber()
    @Min(1)
    capacity: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    availableSeats?: number;
}
