
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ConfirmarCadastroDto } from './dto/confirmar-cadastro.dto';

import * as bcrypt from 'bcrypt';

interface CadastroPendente {
    dados: CreateUsuarioDto;
    codigo: string;
    expiraEm: number;
}

const VALIDADE_CODIGO_MS = 10 * 60 * 1000;

@Injectable()
export class UsuariosService {

    private readonly cadastrosPendentes =
        new Map<string, CadastroPendente>();

    constructor(
        private readonly databaseService: DatabaseService
    ) {}


    async solicitarCadastro(
        dados: CreateUsuarioDto
    ) {

        const usuarioExistente =
            await this.databaseService.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [dados.email]
            ) as any[];


        if (usuarioExistente.length > 0) {

            throw new ConflictException(
                'Este e-mail já está cadastrado'
            );

        }


        const codigo =
            String(
                Math.floor(1000 + Math.random() * 9000)
            );


        this.cadastrosPendentes.set(
            dados.email,
            {
                dados,
                codigo,
                expiraEm: Date.now() + VALIDADE_CODIGO_MS
            }
        );


        console.log(
            `\n===================================\n` +
            `Código de confirmação de cadastro\n` +
            `E-mail: ${dados.email}\n` +
            `Código: ${codigo}\n` +
            `===================================\n`
        );


        return {

            mensagem:
                'Código de confirmação enviado. Verifique o terminal do backend.',

            email: dados.email

        };

    }


    async confirmarCadastro(
        dados: ConfirmarCadastroDto
    ) {

        const pendente =
            this.cadastrosPendentes.get(dados.email);


        if (!pendente) {

            throw new BadRequestException(
                'Nenhum cadastro pendente foi encontrado para este e-mail. Refaça o cadastro.'
            );

        }


        if (Date.now() > pendente.expiraEm) {

            this.cadastrosPendentes.delete(dados.email);

            throw new BadRequestException(
                'O código expirou. Solicite um novo código.'
            );

        }


        if (dados.codigo !== pendente.codigo) {

            throw new BadRequestException(
                'Código de confirmação inválido'
            );

        }


        const resultado =
            await this.criarUsuario(pendente.dados);


        this.cadastrosPendentes.delete(dados.email);


        return resultado;

    }


    async criarUsuario(
        dados: CreateUsuarioDto
    ) {

        const usuarioExistente =
            await this.databaseService.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                `,
                [dados.email]
            ) as any[];


        if (usuarioExistente.length > 0) {

            throw new ConflictException(
                'Este e-mail já está cadastrado'
            );

        }


        const senhaCriptografada =
            await bcrypt.hash(
                dados.senha,
                10
            );


        const resultado =
            await this.databaseService.query(
                `
                INSERT INTO usuarios (
                    nome,
                    sobrenome,
                    email,
                    telefone,
                    senha,
                    estado,
                    data_nascimento,
                    orcamento,
                    notificacoes_email,
                    alertas_eventos,
                    notificacoes_ofertas
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    dados.nome,
                    dados.sobrenome,
                    dados.email,
                    dados.telefone,
                    senhaCriptografada,
                    dados.estado,
                    dados.data_nascimento,
                    dados.orcamento,
                    dados.notificacoes_email,
                    dados.alertas_eventos,
                    dados.notificacoes_ofertas
                ]
            ) as any;


        return {

            mensagem: 'Usuário cadastrado com sucesso',

            usuario: {
                id: resultado.insertId,
                nome: dados.nome,
                sobrenome: dados.sobrenome,
                email: dados.email
            }

        };

    }


    async buscarPerfil(
        id: number
    ) {

        const usuarios =
            await this.databaseService.query(
                `
                SELECT
                    id,
                    nome,
                    sobrenome,
                    email,
                    telefone,
                    estado,
                    data_nascimento,
                    orcamento,
                    notificacoes_email,
                    alertas_eventos,
                    notificacoes_ofertas
                FROM usuarios
                WHERE id = ?
                `,
                [id]
            ) as any[];


        if (usuarios.length === 0) {

            throw new NotFoundException(
                'Usuário não encontrado'
            );

        }


        return {
            usuario: usuarios[0]
        };

    }


    async atualizarPerfil(
        id: number,
        dados: UpdateUsuarioDto
    ) {

        const emailExistente =
            await this.databaseService.query(
                `
                SELECT id
                FROM usuarios
                WHERE email = ?
                AND id <> ?
                `,
                [
                    dados.email,
                    id
                ]
            ) as any[];


        if (emailExistente.length > 0) {

            throw new ConflictException(
                'Este e-mail já está cadastrado'
            );

        }


        const usuarioExistente =
            await this.databaseService.query(
                `
                SELECT id
                FROM usuarios
                WHERE id = ?
                `,
                [id]
            ) as any[];


        if (usuarioExistente.length === 0) {

            throw new NotFoundException(
                'Usuário não encontrado'
            );

        }


        await this.databaseService.query(
            `
            UPDATE usuarios
            SET
                nome = ?,
                sobrenome = ?,
                email = ?,
                telefone = ?,
                estado = ?
            WHERE id = ?
            `,
            [
                dados.nome,
                dados.sobrenome,
                dados.email,
                dados.telefone,
                dados.estado,
                id
            ]
        );


        return {

            mensagem: 'Perfil atualizado com sucesso'

        };

    }

}

