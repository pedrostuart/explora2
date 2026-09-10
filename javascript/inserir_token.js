const API_URL = "http://localhost:3000";

const inputsCodigo = [
    document.getElementById("cod1"),
    document.getElementById("cod2"),
    document.getElementById("cod3"),
    document.getElementById("cod4")
];

const formToken =
    document.getElementById("formToken");

const btnConfirmarCodigo =
    document.getElementById("btnConfirmarCodigo");

const btnReenviarCodigo =
    document.getElementById("btnReenviarCodigo");

const mensagemToken =
    document.getElementById("mensagemToken");

const linkVoltar =
    document.getElementById("linkVoltar");

const caixaEmail =
    document.getElementById("caixaEmail");


inputsCodigo.forEach((input, indice) => {

    input.addEventListener("input", () => {

        input.value = input.value.replace(/[^0-9]/g, "");

        if (input.value && indice < inputsCodigo.length - 1) {
            inputsCodigo[indice + 1].focus();
        }

    });

    input.addEventListener("keydown", (evento) => {

        if (evento.key === "Backspace" && !input.value && indice > 0) {
            inputsCodigo[indice - 1].focus();
        }

    });

});


function mostrarMensagem(texto, cor) {

    mensagemToken.textContent = texto;
    mensagemToken.style.color = cor;
    mensagemToken.style.display = "block";

}


const emailCadastro =
    sessionStorage.getItem("emailConfirmacaoCadastro");

const dadosCadastroCompleto =
    JSON.parse(
        sessionStorage.getItem("dadosCadastroCompleto") || "null"
    );

const emailRecuperacao =
    sessionStorage.getItem("emailRecuperacaoSenha");


let fluxo = null;
let email = null;

if (emailCadastro) {

    fluxo = "cadastro";
    email = emailCadastro;

    if (linkVoltar) linkVoltar.href = "preferencias.html";
    if (caixaEmail) caixaEmail.href = "cadastro.html";

} else if (emailRecuperacao) {

    fluxo = "recuperacao";
    email = emailRecuperacao;

    if (linkVoltar) linkVoltar.href = "esqueceu-senha.html";
    if (caixaEmail) caixaEmail.href = "esqueceu-senha.html";

}


if (!fluxo) {

    mostrarMensagem(
        "Não encontramos uma solicitação pendente. Refaça o processo anterior.",
        "red"
    );

    if (btnConfirmarCodigo) btnConfirmarCodigo.disabled = true;
    if (btnReenviarCodigo) btnReenviarCodigo.disabled = true;

}


if (formToken) {

    formToken.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        if (!fluxo) return;

        const codigo =
            inputsCodigo.map(input => input.value).join("");

        if (codigo.length !== 4) {

            mostrarMensagem(
                "Informe os 4 dígitos do código.",
                "red"
            );

            return;

        }

        const endpointConfirmar =
            fluxo === "cadastro"
                ? "/usuarios/confirmar-cadastro"
                : "/auth/confirmar-recuperacao-senha";

        try {

            const resposta =
                await fetch(
                    `${API_URL}${endpointConfirmar}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            codigo
                        })
                    }
                );

            const resultado =
                await resposta.json();

            if (!resposta.ok) {

                mostrarMensagem(
                    resultado.message ||
                    "Não foi possível confirmar o código.",
                    "red"
                );

                return;

            }

            if (fluxo === "cadastro") {

                mostrarMensagem(
                    "Cadastro confirmado com sucesso! Redirecionando...",
                    "green"
                );

                sessionStorage.removeItem("dadosCadastroCompleto");
                sessionStorage.removeItem("emailConfirmacaoCadastro");

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1500);

            } else {

                mostrarMensagem(
                    "Código confirmado! Agora escolha sua nova senha.",
                    "green"
                );

                setTimeout(() => {
                    window.location.href = "mudar-senha.html";
                }, 1500);

            }

        } catch (erro) {

            console.error(
                "Erro ao confirmar código:",
                erro
            );

            mostrarMensagem(
                "Não foi possível conectar com o servidor.",
                "red"
            );

        }

    });

}


if (btnReenviarCodigo) {

    btnReenviarCodigo.addEventListener("click", async (evento) => {

        evento.preventDefault();

        if (!fluxo) return;

        if (fluxo === "cadastro" && !dadosCadastroCompleto) {

            mostrarMensagem(
                "Não é possível reenviar: dados do cadastro não encontrados.",
                "red"
            );

            return;

        }

        const endpointReenviar =
            fluxo === "cadastro"
                ? "/usuarios/solicitar-cadastro"
                : "/auth/solicitar-recuperacao-senha";

        const corpoReenviar =
            fluxo === "cadastro"
                ? dadosCadastroCompleto
                : { email };

        try {

            const resposta =
                await fetch(
                    `${API_URL}${endpointReenviar}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(corpoReenviar)
                    }
                );

            const resultado =
                await resposta.json();

            if (!resposta.ok) {

                mostrarMensagem(
                    resultado.message ||
                    "Não foi possível reenviar o código.",
                    "red"
                );

                return;

            }

            mostrarMensagem(
                "Novo código enviado. Verifique o terminal do backend.",
                "green"
            );

            inputsCodigo.forEach(input => input.value = "");
            inputsCodigo[0].focus();

        } catch (erro) {

            console.error(
                "Erro ao reenviar código:",
                erro
            );

            mostrarMensagem(
                "Não foi possível conectar com o servidor.",
                "red"
            );

        }

    });

}
