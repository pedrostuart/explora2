const API_URL = "http://localhost:3000";

const formEsqueceuSenha =
    document.querySelector("form");

const enviarCodigo =
    document.querySelector("#enviar_codigo");

const inputEmail =
    document.getElementById("email");


enviarCodigo.addEventListener("click", async (evento) => {

    evento.preventDefault();

    const barraInput =
        inputEmail.parentElement;

    const email =
        inputEmail.value.trim();


    if (email === "") {

        inputEmail.classList.add("placeholder-erro");
        barraInput.style.border = "1px solid red";

        return;

    }


    inputEmail.classList.remove("placeholder-erro");
    barraInput.style.border = "1px solid #1A824D";


    try {

        const resposta =
            await fetch(
                `${API_URL}/auth/solicitar-recuperacao-senha`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email })
                }
            );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {

            console.error(resultado);

            barraInput.style.border = "1px solid red";

            alert(
                resultado.message ||
                "Não foi possível enviar o código."
            );

            return;

        }

        sessionStorage.setItem(
            "emailRecuperacaoSenha",
            email
        );

        window.location.href = "inserir-token.html";

    } catch (erro) {

        console.error(
            "Erro ao solicitar recuperação de senha:",
            erro
        );

        alert(
            "Não foi possível conectar com o servidor."
        );

    }

});
