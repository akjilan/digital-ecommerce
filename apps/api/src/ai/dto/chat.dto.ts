import { IsString, MaxLength, IsNotEmpty } from "class-validator";

export class ChatMessageDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message!: string;
}
