import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  // Use fullName to match the User schema and shared types
  @IsNotEmpty()
  fullName: string;
}
