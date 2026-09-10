import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Length,
    MaxLength
} from 'class-validator';

export class ConfirmarRecuperacaoSenhaDto {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(240)
    email: string;

    @IsString()
    @IsNotEmpty()
    @Length(4, 4, {
        message: 'O código deve conter exatamente 4 dígitos'
    })
    codigo: string;

}
