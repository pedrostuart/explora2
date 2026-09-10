import {
    IsEmail,
    IsNotEmpty,
    MaxLength
} from 'class-validator';

export class SolicitarRecuperacaoSenhaDto {

    @IsEmail()
    @IsNotEmpty()
    @MaxLength(240)
    email: string;

}
