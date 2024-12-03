const apiUrl = "https://espacosmart.bitrix24.com/rest/69599/mbsli9bt4nxz2joq/";

async function obterUsuarioAtual() {
    if (typeof BX24 !== "undefined" && BX24?.callMethod) {
        // ! LOG TESTE: Detecção do ambiente Bitrix (SDK disponível)
        console.log("[LOG TESTE] Ambiente Bitrix detectado, utilizando o SDK BX24");

        // Se o ambiente Bitrix estiver disponível, usa o SDK
        return new Promise((resolve) => {
            BX24.callMethod("user.current", {}, (res) => {
                if (res.error()) {
                    //* Erro ao obter usuário pelo SDK
                    resolve(null);
                } else {
                    //* Sucesso ao obter usuário pelo SDK
                    console.log("[LOG TESTE] Usuário obtido pelo SDK:", res.data());
                    resolve(res.data());
                }
            });
        });
    } else { 
        // Usa a API REST se o SDK não estiver disponível
        try {
            const response = await fetch(`${apiUrl}user.current`);
            if (!response.ok) {
                throw new Error(`Erro ao acessar a API: ${response.statusText}`);
            }
            const data = await response.json();

            if (data.error) {
                console.error("[LOG TESTE] Erro ao obter o usuário atual pela API REST:", data.error);
                return null;
            }
            return data.result || null;
        } catch (error) {
            console.error("[LOG TESTE] Erro ao acessar a API REST:", error);
            return null;
        }
    }
}

async function TipoSolicitacao() {
    const select = document.getElementById("motivos");
    try {
        const response = await fetch(`${apiUrl}crm.item.fields?entityTypeId=168`);
        if (!response.ok) {
            throw new Error(`Erro ao acessar a API: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        const items = data.result?.fields?.ufCrm95TipoSolicitacao?.items || [];
        console.log(items);
        if (items.length === 0) {
            throw new Error("Nenhuma opção disponível para o campo Motivo Acesso.");
        }

        items.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.ID;
            option.textContent = item.VALUE;
            select.appendChild(option);
        });

        // Configurar select2 se disponível
        if (window.$ && $(select).select2) {
            $(select).select2({
                placeholder: "Selecione o motivo de acesso",
                allowClear: true,
            });
        }
    } catch (error) {
        console.error("Erro ao carregar opções do campo Motivo Acesso:", error);
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function Cargo() {
    const select = document.getElementById("nome-vaga");
    if (!select) {
        console.error("[LOG TESTE] Elemento select com ID 'nome-vaga' não encontrado.");
        return;
    }

    let start = 0;
    let hasMore = true;

    try {
        // Limpa o select antes de adicionar novos valores
        select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

        while (hasMore) {
            const response = await fetch(`${apiUrl}crm.item.list?entityTypeId=1082&start=${start}`);
            if (!response.ok) {
                throw new Error(`Erro ao acessar a API: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Acessa os itens diretamente no caminho correto
            const items = data.result?.items || [];
            console.log(`[LOG TESTE] Itens retornados da página ${start}:`, items);

            if (items.length === 0) {
                hasMore = false;
                break;
            }

            // Adiciona as opções ao select com base no título
            items.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id; // Usa o ID como valor
                option.textContent = item.title; // Usa o título como texto exibido
                select.appendChild(option);
            });

            // Verifica se há mais páginas
            if (data.next) {
                start = data.next; // Atualiza o ponto de início para a próxima página
            } else {
                hasMore = false;
            }
        }

        console.log("[LOG TESTE] Todas as opções carregadas com sucesso.");

        // Configurar select2 se disponível
        if (window.$ && $(select).select2) {
            $(select).select2({
                placeholder: "Selecione o cargo",
                allowClear: true,
            });
            console.log("[LOG TESTE] Select2 configurado com sucesso.");
        }
    } catch (error) {
        console.error("[LOG TESTE] Erro ao carregar opções do campo Nome da Vaga:", error);
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function setor() {
    const select = document.getElementById("setor");
    if (!select) {
        return;
    }

    let start = 0;
    let hasMore = true;

    try {
        // Limpa o select antes de adicionar novos valores
        select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

        while (hasMore) {
            const response = await fetch(`${apiUrl}crm.item.list?entityTypeId=176&start=${start}`);
            if (!response.ok) {
                throw new Error(`Erro ao acessar a API: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Acessa os itens diretamente no caminho correto
            const items = data.result?.items || [];
            console.log(`[LOG SETOR] Itens retornados da página ${start}:`, items);

            if (items.length === 0) {
                hasMore = false;
                break;
            }

            // Adiciona as opções ao select com base no título
            items.forEach((item) => {
                const option = document.createElement("option");
                option.value = item.id; // Usa o ID como valor
                option.textContent = item.title; // Usa o título como texto exibido
                select.appendChild(option);
            });

            // Verifica se há mais páginas
            if (data.next) {
                start = data.next; // Atualiza o ponto de início para a próxima página
            } else {
                hasMore = false;
            }
        }

        console.log("[LOG SETOR] Todas as opções carregadas com sucesso.");

        // Configurar select2 se disponível
        if (window.$ && $(select).select2) {
            $(select).select2({
                placeholder: "Selecione o cargo",
                allowClear: true,
            });
            console.log("[LOG SETOR] Select2 configurado com sucesso.");
        }
    } catch (error) {
        console.error("[LOG SETOR] Erro ao carregar opções do campo Nome da Vaga:", error);
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}

async function carregarUsuarios() {
    const select = document.getElementById("colaborador");
    if (!select) {
        console.error("[LOG TESTE] Elemento select com ID 'usuarios' não encontrado.");
        return;
    }

    let start = 0;
    let hasMore = true;

    try {
        // Limpa o select antes de adicionar novos valores
        select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

        while (hasMore) {
            const response = await fetch(`${apiUrl}user.get?start=${start}`);
            if (!response.ok) {
                throw new Error(`Erro ao acessar a API: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            // Acessa os itens diretamente no caminho correto
            const items = data.result || [];

            if (items.length === 0) {
                hasMore = false;
                break;
            }

            // Adiciona as opções ao select com base no ID, Nome e Departamento
            items.forEach((user) => {
                const option = document.createElement("option");
                option.value = user.ID; // Usa o ID como valor
                //! option.textContent = `${user.NAME} ${user.LAST_NAME} - Departamento: ${user.UF_DEPARTMENT?.join(', ') || 'N/A'}`;
                option.textContent = `${user.NAME} ${user.LAST_NAME}`;
                select.appendChild(option);
            });

            // Verifica se há mais páginas
            if (data.next) {
                start = data.next; // Atualiza o ponto de início para a próxima página
            } else {
                hasMore = false;
            }
        }

        console.log("[LOG TESTE] Todos os usuários carregados com sucesso.");

        // Configurar select2 se disponível
        if (window.$ && $(select).select2) {
            $(select).select2({
                placeholder: "Selecione um usuário",
                allowClear: true,
            });
            console.log("[LOG TESTE] Select2 configurado com sucesso.");
        }
    } catch (error) {
        console.error("[LOG TESTE] Erro ao carregar opções de usuários:", error);
        select.innerHTML = '<option value="">Erro ao carregar usuários</option>';
    }
}

async function vagaConfidencial() {
    const select = document.getElementById("vaga-confidencial");
    if (!select) {
        console.error("[LOG Confidencial] Elemento select com ID 'vaga-confidencial' não encontrado.");
        return;
    }

    try {
        // Limpa o select antes de adicionar novos valores
        select.innerHTML = '<option value="" disabled selected>Carregando...</option>';

        const response = await fetch(`${apiUrl}crm.item.fields?entityTypeId=168`);
        if (!response.ok) {
            throw new Error(`Erro ao acessar a API: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        // Acessa diretamente os itens de ufCrm95Confidencial
        const items = data.result?.fields?.ufCrm95Confidencial?.items || [];
        console.log("[LOG Confidencial] Itens carregados para ufCrm95Confidencial:", items);

        if (items.length === 0) {
            throw new Error("Nenhuma opção disponível para o campo Vaga Confidencial.");
        }

        // Adiciona as opções ao select com base no ID e VALUE
        items.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.ID; // Usa o ID como valor
            option.textContent = item.VALUE; // Usa o VALUE como texto exibido
            select.appendChild(option);
        });

        console.log("[LOG Confidencial] Todas as opções para Vaga Confidencial carregadas com sucesso.");

        // Configurar select2 se disponível
        if (window.$ && $(select).select2) {
            $(select).select2({
                placeholder: "Selecione uma opção",
                allowClear: true,
            });
            console.log("[LOG Confidencial] Select2 configurado com sucesso.");
        }
    } catch (error) {
        console.error("[LOG Confidencial] Erro ao carregar opções do campo Vaga Confidencial:", error);
        select.innerHTML = '<option value="">Erro ao carregar opções</option>';
    }
}


async function submitForm(event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    try {
        // Obtém o ID do usuário atual
        const currentUser = await obterUsuarioAtual();
        if (!currentUser || !currentUser.ID) {
            throw new Error("Erro ao obter o ID do usuário atual.");
        }
        if (!currentUser || !currentUser.UF_DEPARTMENT[0]) {
            throw new Error("Erro ao obter o ID do usuário atual.");
        }
        // Captura os valores dos campos
        const nomeVaga = document.getElementById("nome-vaga").value;
        const tipoSolicitacao = document.getElementById("motivos").value;
        const setor = document.getElementById("setor").value;
        const colaborador = document.getElementById("colaborador").value;
        const vagaConfidencial = document.getElementById("vaga-confidencial").value;
        const descricaoVaga = document.getElementById("descricao-vaga").value;
        const requisitosVaga = document.getElementById("requisitos-vaga").value;

        // Monta o payload
        const formData = {
            entityTypeId: "168",
            fields: {
                ufCrm95TipoSolicitacao: tipoSolicitacao,
                ufCrm95Confidencial: vagaConfidencial,
                ufCrm95Solicitante: currentUser.ID, // Adiciona o ID do usuário atual
                ufCrm95Cargo: nomeVaga,
                ufCrm95Setores: setor,
                ufCrm95ColaboradorSubs: colaborador,
                ufCrm95Descricao: descricaoVaga,
                ufCrm95Requisitos: requisitosVaga,
                ufCrm95Teste: currentUser.UF_DEPARTMENT[0]
            },
        };

        console.log("[LOG TESTE] Dados enviados:", formData);

        // Envia os dados para a API
        const response = await fetch(`${apiUrl}crm.item.add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        const responseData = await response.json();

        if (responseData.error) {
            console.error("[LOG TESTE] Erro ao enviar dados:", responseData.error);
            alert(`Erro ao enviar: ${responseData.error_description || "Erro desconhecido"}`);
        } else {
            alert("Formulário enviado com sucesso!");
            console.log("ID do item criado:", responseData.result);
        }
    } catch (error) {
        console.error("[LOG TESTE] Erro no envio:", error);
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