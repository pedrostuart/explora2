const API_URL = "http://localhost:3000";

const formNovaSenha =
    document.getElementById("formNovaSenha");

const inputSenhaNova =
    document.getElementById("senha_nova");

const inputConfirmarSenhaNova =
    document.getElementById("confirmar_senha_nova");

const mensagemSenha =
    document.getElementById("mensagemSenha");


function mostrarMensagem(texto, cor) {

    mensagemSenha.textContent = texto;
    mensagemSenha.style.color = cor;
    mensagemSenha.style.display = "block";

}


const email =
    sessionStorage.getItem("emailRecuperacaoSenha");


if (!email) {

    mostrarMensagem(
        "Não encontramos uma recuperação de senha em andamento. Refaça o processo.",
        "red"
    );

}


if (formNovaSenha) {

    formNovaSenha.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        if (!email) return;

        const senhaNova =
            inputSenhaNova.value;

        const confirmarSenhaNova =
            inputConfirmarSenhaNova.value;


        if (senhaNova.length < 6) {

            mostrarMensagem(
                "A senha deve ter pelo menos 6 caracteres.",
                "red"
            );

            return;

        }


        if (senhaNova !== confirmarSenhaNova) {

            mostrarMensagem(
                "As senhas não são iguais.",
                "red"
            );

            return;

        }


        try {

            const resposta =
                await fetch(
                    `${API_URL}/auth/redefinir-senha`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email,
                            novaSenha: senhaNova
                        })
                    }
                );

            const resultado =
                await resposta.json();

            if (!resposta.ok) {

                mostrarMensagem(
                    resultado.message ||
                    "Não foi possível redefinir a senha.",
                    "red"
                );

                return;

            }

            mostrarMensagem(
                "Senha redefinida com sucesso! Redirecionando para o login...",
                "green"
            );

            sessionStorage.removeItem("emailRecuperacaoSenha");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } catch (erro) {

            console.error(
                "Erro ao redefinir senha:",
                erro
            );

            mostrarMensagem(
                "Não foi possível conectar com o servidor.",
                "red"
            );

        }

    });

}
