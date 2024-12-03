const apiUrl = "https://espacosmart.bitrix24.com/rest/69599/mbsli9bt4nxz2joq/";

// Função auxiliar para realizar chamadas à API
async function fetchData(url, errorMessage) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`${errorMessage}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data;
    } catch (error) {
        console.error(`Erro: ${error.message}`);
        throw error;
    }
}

// Função auxiliar para preencher um select
function populateSelect(selectElement, items, placeholder) {
    if (!selectElement) return;

    selectElement.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.ID || item.id;
        option.textContent = item.VALUE || item.title;
        selectElement.appendChild(option);
    });

    if (window.$ && $(selectElement).select2) {
        $(selectElement).select2({
            placeholder,
            allowClear: true,
        });
    }
}


async function obterUsuarioAtual() {
    if (typeof BX24 !== "undefined" && BX24?.callMethod) {
        return new Promise((resolve) => {
            BX24.callMethod("user.current", {}, (res) => {
                if (res.error()) {
                    resolve(null);
                } else {
                    resolve(res.data());
                }
            });
        });
    } else {
        try {
            const data = await fetchData(`${apiUrl}user.current`, "Erro ao acessar a API REST para usuário atual");
            return data.result || null;
        } catch {
            return null;
        }
    }
}

async function TipoSolicitacao() {
    const select = document.getElementById("motivos");
    try {
        const data = await fetchData(`${apiUrl}crm.item.fields?entityTypeId=168`, "Erro ao carregar os motivos de solicitação");
        const items = data.result?.fields?.ufCrm95TipoSolicitacao?.items || [];
        populateSelect(select, items, "Selecione o motivo de acesso");
    } catch {
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function carregarItens(entityTypeId, selectId, placeholder) {
    const select = document.getElementById(selectId);
    if (!select) return;

    let start = 0;
    let hasMore = true;

    try {
        select.innerHTML = `<option value="" disabled selected>${placeholder}</option>`;
        while (hasMore) {
            const data = await fetchData(`${apiUrl}crm.item.list?entityTypeId=${entityTypeId}&start=${start}`, `Erro ao carregar itens para ${selectId}`);
            const items = data.result?.items || [];
            populateSelect(select, items, placeholder);

            hasMore = Boolean(data.next);
            start = data.next || 0;
        }
    } catch {
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function Cargo() {
    await carregarItens(1082, "nome-vaga", "Selecione o cargo");
}

async function setor() {
    await carregarItens(176, "setor", "Selecione o setor");
}

async function carregarUsuarios() {
    const select = document.getElementById("colaborador");
    if (!select) return;

    let start = 0;
    let hasMore = true;

    try {
        select.innerHTML = `<option value="" disabled selected>Selecione um usuário</option>`;
        while (hasMore) {
            const data = await fetchData(`${apiUrl}user.get?start=${start}`, "Erro ao carregar usuários");
            const items = data.result || [];

            items.forEach((user) => {
                const option = document.createElement("option");
                option.value = user.ID;
                option.textContent = `${user.NAME} ${user.LAST_NAME}`;
                select.appendChild(option);
            });

            hasMore = Boolean(data.next);
            start = data.next || 0;
        }
    } catch {
        select.innerHTML = '<option value="">Erro ao carregar usuários</option>';
    }
}

async function vagaConfidencial() {
    const select = document.getElementById("vaga-confidencial");
    try {
        const data = await fetchData(`${apiUrl}crm.item.fields?entityTypeId=168`, "Erro ao carregar as opções confidenciais");
        const items = data.result?.fields?.ufCrm95Confidencial?.items || [];
        populateSelect(select, items, "Selecione uma opção");
    } catch {
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function obterDepartamentoNome(departmentId) {
    try {
        const data = await fetchData(`${apiUrl}department.get?ID=${departmentId}`, "Erro ao acessar a API do departamento");
        return data.result?.[0]?.NAME || "Departamento não encontrado";
    } catch {
        return "Erro ao obter o departamento";
    }
}

async function submitForm(event) {
    event.preventDefault();

    try {
        const currentUser = await obterUsuarioAtual();
        if (!currentUser || !currentUser.UF_DEPARTMENT?.[0]) {
            throw new Error("Usuário ou departamento inválido.");
        }

        const departmentName = await obterDepartamentoNome(currentUser.UF_DEPARTMENT[0]);

        const formData = {
            entityTypeId: "168",
            fields: {
                ufCrm95TipoSolicitacao: document.getElementById("motivos").value,
                ufCrm95Confidencial: document.getElementById("vaga-confidencial").value,
                ufCrm95Solicitante: currentUser.ID,
                ufCrm95Teste: departmentName,
                ufCrm95Cargo: document.getElementById("nome-vaga").value,
                ufCrm95Setores: document.getElementById("setor").value,
                ufCrm95Descricao: document.getElementById("descricao-vaga").value,
                ufCrm95Requisitos: document.getElementById("requisitos-vaga").value,
                ufCrm95ColaboradorSubs: document.getElementById("colaborador").value,
            },
        };

        const response = await fetch(`${apiUrl}crm.item.add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        const responseData = await response.json();
        if (responseData.error) {
            throw new Error(responseData.error_description || "Erro desconhecido.");
        }

        alert("Formulário enviado com sucesso!");
    } catch (error) {
        console.error(`Erro ao enviar o formulário: ${error.message}`);
        alert("Erro ao enviar o formulário. Por favor, tente novamente.");
    }
}

window.addEventListener("DOMContentLoaded", () => {
    TipoSolicitacao();
    Cargo();
    setor();
    carregarUsuarios();
    vagaConfidencial();
});

document.getElementById("vagaForm").addEventListener("submit", submitForm);