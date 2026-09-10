import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { DatabaseService } from '../database/database.service';

import { LoginDto } from './dto/login.dto';
import { SolicitarRecuperacaoSenhaDto } from './dto/solicitar-recuperacao-senha.dto';
import { ConfirmarRecuperacaoSenhaDto } from './dto/confirmar-recuperacao-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

import * as bcrypt from 'bcrypt';

interface RecuperacaoPendente {
    codigo: string;
    confirmado: boolean;
    expiraEm: number;
}

const VALIDADE_CODIGO_MS = 10 * 60 * 1000;

@Injectable()
export class AuthService {

    private readonly recuperacoesPendentes =
        new Map<string, RecuperacaoPendente>();

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly jwtService: JwtService
    ) {}


    async login(dados: LoginDto) {

        const usuarios =
            await this.databaseService.query(
                `
                SELECT *
                FROM usuarios
                WHERE email = ?
                `,
                [dados.email]
            ) as any[];


        if (usuarios.length === 0) {

            throw new UnauthorizedException(
                'E-mail ou senha inválidos'
            );

        }


        const usuario = usuarios[0];


        const senhaValida =
            await bcrypt.compare(
                dados.senha,
                usuario.senha
            );


        if (!senhaValida) {

            throw new UnauthorizedException(
                'E-mail ou senha inválidos'
            );

        }


        const payload = {
            sub: usuario.id,
            email: usuario.email
        };


        const token =
            await this.jwtService.signAsync(payload);


        return {

            mensagem: 'Login realizado com sucesso',

            token,

            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                sobrenome: usuario.sobrenome,
                email: usuario.email
            }

        };

    }


    async solicitarRecuperacaoSenha(
        dados: SolicitarRecuperacaoSenhaDto
    ) {

        const usuarios =
            await this.databaseService.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [dados.email]
            ) as any[];


        if (usuarios.length === 0) {

            throw new NotFoundException(
                'Não encontramos nenhuma conta com este e-mail'
            );

        }


        const codigo =
            String(
                Math.floor(1000 + Math.random() * 9000)
            );


        this.recuperacoesPendentes.set(
            dados.email,
            {
                codigo,
                confirmado: false,
                expiraEm: Date.now() + VALIDADE_CODIGO_MS
            }
        );


        console.log(
            `\n===================================\n` +
            `Código de recuperação de senha\n` +
            `E-mail: ${dados.email}\n` +
            `Código: ${codigo}\n` +
            `===================================\n`
        );


        return {

            mensagem:
                'Código de recuperação enviado. Verifique o terminal do backend.',

            email: dados.email

        };

    }


    async confirmarRecuperacaoSenha(
        dados: ConfirmarRecuperacaoSenhaDto
    ) {

        const pendente =
            this.recuperacoesPendentes.get(dados.email);


        if (!pendente) {

            throw new BadRequestException(
                'Nenhuma recuperação pendente foi encontrada para este e-mail. Solicite um novo código.'
            );

        }


        if (Date.now() > pendente.expiraEm) {

            this.recuperacoesPendentes.delete(dados.email);

            throw new BadRequestException(
                'O código expirou. Solicite um novo código.'
            );

        }


        if (dados.codigo !== pendente.codigo) {

            throw new BadRequestException(
                'Código de confirmação inválido'
            );

        }


        pendente.confirmado = true;


        return {

            mensagem: 'Código confirmado com sucesso'

        };

    }


    async redefinirSenha(
        dados: RedefinirSenhaDto
    ) {

        const pendente =
            this.recuperacoesPendentes.get(dados.email);


        if (!pendente || !pendente.confirmado) {

            throw new BadRequestException(
                'Confirme o código de recuperação antes de definir uma nova senha.'
            );

        }


        if (Date.now() > pendente.expiraEm) {

            this.recuperacoesPendentes.delete(dados.email);

            throw new BadRequestException(
                'O código expirou. Solicite um novo código.'
            );

        }


        const senhaCriptografada =
            await bcrypt.hash(
                dados.novaSenha,
                10
            );


        await this.databaseService.query(
            `
            UPDATE usuarios
            SET senha = ?
            WHERE email = ?
            `,
            [
                senhaCriptografada,
                dados.email
            ]
        );


        this.recuperacoesPendentes.delete(dados.email);


        return {

            mensagem: 'Senha redefinida com sucesso'

        };

    }

}