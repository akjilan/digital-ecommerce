import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8)
  @IsString()
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @MinLength(8)
  @IsString()
  @IsOptional()
  password?: string;
}
