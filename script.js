const apiUrl = "https://espacosmart.bitrix24.com/rest/69599/mbsli9bt4nxz2joq/";

// Função para obter o usuário atual com logs adicionais para debugging
async function getCurrentUser() {
    return new Promise((resolve) => {
        BX24.callMethod("user.current", {}, (res) => {
            if (res.error()) {
                console.error("Erro ao obter o usuário atual pelo SDK:", res.error());
                resolve(null);
            } else {
                console.log("DEPARTAMENTO:", res.data().UF_DEPARTMENT?.[0]);
                resolve(res.data().UF_DEPARTMENT?.[0]);
            }
        });
    });
}

// Função para carregar opções de colaboradores
async function loadColaboradorOptions(departmentNumber) {
    const select = document.getElementById("colaborador");
    try {
        const response = await fetch(`${apiUrl}user.get?FILTER[UF_DEPARTMENT]=${departmentNumber}`);
        const data = await response.json();
        console.log("Resposta da API para colaboradores:", data);
        if (!data.result) throw new Error("Nenhum colaborador encontrado.");

        console.log("Colaboradores carregados:", data.result);
        select.innerHTML = data.result
            .map(
                (user) =>
                    `<option value="${user.NAME} ${user.LAST_NAME}">${user.NAME} ${user.LAST_NAME}</option>`
            )
            .join("");
    } catch (error) {
        console.error("Erro ao carregar colaboradores:", error);
        select.innerHTML = '<option value="">Erro ao carregar colaboradores</option>';
    }
}

// Função para buscar títulos
async function fetchTitles() {
    try {
        const response = await fetch(`${apiUrl}crm.item.list?entityTypeId=1082`);
        const data = await response.json();
        console.log("Resposta da API para títulos:", data);
        if (!data.result?.items) throw new Error("Nenhum título encontrado.");

        console.log("Títulos carregados:", data.result.items);
        populateDropdown(data.result.items.map((item) => item.title));
    } catch (error) {
        console.error("Erro ao buscar títulos:", error);
    }
}

// Função para carregar opções de motivos
async function loadMotivosOptions() {
    const select = document.getElementById("motivos");
    try {
        const response = await fetch(`${apiUrl}crm.item.fields?entityTypeId=168`);
        console.log("Resposta da API para motivos:", response);
        if (!response.ok) throw new Error("Erro ao acessar o endpoint de motivos.");

        const data = await response.json();
        const items = data.result?.fields?.ufCrm95TipoSolicitacao?.items || [];
        if (!items.length) throw new Error("Nenhuma opção de motivo disponível.");

        console.log("Motivos carregados:", items);
        select.innerHTML = items
            .map((item) => `<option value="${item.ID}">${item.VALUE}</option>`)
            .join("");
        if (window.$ && $(select).select2) {
            $(select).select2({ placeholder: "Selecione o motivo de acesso", allowClear: true });
        }
    } catch (error) {
        console.error("Erro ao carregar motivos:", error);
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

// Função para popular o dropdown de títulos
function populateDropdown(titles) {
    const select = document.getElementById("nome-vaga");
    select.innerHTML =
        `<option value="">Selecione uma opção</option>` +
        titles.map((title) => `<option value="${title}">${title}</option>`).join("");
}

// Função para enviar o formulário
async function submitForm(event) {
    event.preventDefault(); // Previne o comportamento padrão do formulário

    try {
        const nomeVaga = document.getElementById("nome-vaga").value;
        const motivoSolicitacao = document.getElementById("motivos").value;
        const colaboradorSubstituido = document.getElementById("colaborador").value;
        const vagaConfidencial = document.getElementById("vaga-confidencial").value === "sim" ? "Y" : "N";
        const descricaoVaga = document.getElementById("descricao-vaga").value;
        const requisitosVaga = document.getElementById("requisitos-vaga").value;

        const currentUserId = await getCurrentUser();
        if (!currentUserId) {
            throw new Error("Erro ao obter o ID do usuário atual.");
        }

        const formData = {
            entityTypeId: "168",
            fields: {
                ufCrm95Solicitante:currentUserId,
                ufCrm113NomeVaga: nomeVaga,
                ufCrm95TipoSolicitacao: motivoSolicitacao,
                ufCrm113ColaboradorSubstituido: colaboradorSubstituido,
                ufCrm113VagaConfidencial: vagaConfidencial,
                ufCrm113DescricaoVaga: descricaoVaga,
                ufCrm113RequisitosVaga: requisitosVaga,
                assignedById:currentUserId,
            },
        };

        const response = await fetch(`${apiUrl}crm.item.add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const responseData = await response.json();

        if (responseData.error) {
            alert(`Erro ao enviar o formulário: ${responseData.error_description || "Erro desconhecido"}`);
        } else if (responseData.result?.item?.id) {
            alert("Solicitação enviada com sucesso!");
            window.location.href = "confirmation.html";
        } else {
            alert("Resposta inesperada da API. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro ao enviar o formulário:", error);
        alert("Erro ao enviar o formulário. Tente novamente mais tarde.");
    }
}

// Evento de carregamento inicial
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const userDepartamento = await getCurrentUser();
        if (userDepartamento) {
            console.log("Usuário atual obtido com sucesso, ID:", userDepartamento);
            await loadColaboradorOptions(userDepartamento); // Carrega colaboradores pelo departamento
        } else {
            console.warn("Nenhum ID de usuário foi encontrado.");
        }
        fetchTitles(); // Carrega os títulos
        loadMotivosOptions(); // Carrega os motivos de acesso
        document.getElementById("vagaForm").addEventListener("submit", submitForm); // Adiciona o evento de envio ao formulário
    } catch (error) {
        console.error("Erro durante a inicialização:", error);
    }
});