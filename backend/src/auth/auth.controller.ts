import {
    Body,
    Controller,
    Post
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacaoSenhaDto } from './dto/solicitar-recuperacao-senha.dto';
import { ConfirmarRecuperacaoSenhaDto } from './dto/confirmar-recuperacao-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ) {}


    @Post('login')
    login(
        @Body() dados: LoginDto
    ) {

        return this.authService.login(dados);

    }


    @Post('solicitar-recuperacao-senha')
    solicitarRecuperacaoSenha(
        @Body() dados: SolicitarRecuperacaoSenhaDto
    ) {

        return this.authService.solicitarRecuperacaoSenha(
            dados
        );

    }


    @Post('confirmar-recuperacao-senha')
    confirmarRecuperacaoSenha(
        @Body() dados: ConfirmarRecuperacaoSenhaDto
    ) {

        return this.authService.confirmarRecuperacaoSenha(
            dados
        );

    }


    @Post('redefinir-senha')
    redefinirSenha(
        @Body() dados: RedefinirSenhaDto
    ) {

        return this.authService.redefinirSenha(
            dados
        );

    }

}