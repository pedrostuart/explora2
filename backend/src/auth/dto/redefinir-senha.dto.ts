import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength
} from 'class-validator';

export class RedefinirSenhaDto {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(240)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(255)
    novaSenha: string;

}
