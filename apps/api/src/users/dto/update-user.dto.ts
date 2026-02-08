import { IsOptional, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    fullName?: string;
}
