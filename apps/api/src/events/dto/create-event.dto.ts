import { IsNotEmpty, IsString, IsNumber, Min, IsDateString } from 'class-validator';

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
}
