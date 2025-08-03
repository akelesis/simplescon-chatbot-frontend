const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");

const positiveAnswer = ["sim", "s"];
const negativeAnswer = ["não", "nao", "n"];

const chatFlow = {
  welcome: {
    message: () =>
      "Olá, eu sou a SimplesCon IA Fiscal, e vou te ajudar a acessar os serviços fiscais integrados com a Receita Federal via Integra Contador. Digite seu nome para iniciarmos.",
    onReply: (input) => {
      userData.nome = input;
      return "temProcuracao";
    },
  },
  temProcuracao: {
    message: () =>
      `Olá ${userData.nome}! Para iniciarmos é importante saber se você já tem uma procuração ativa conosco. Digite 'sim' ou 'não'.`,
    onReply: (input) => {
      const normalizado = input.trim().toLowerCase();
      if (positiveAnswer.includes(normalizado)) {
        userData.temProcuracao = true;
        return "informarCNPJ";
      } else if (negativeAnswer.includes(normalizado)) {
        userData.temProcuracao = false;
        return "instrucoesProcuracao";
      } else {
        addMessage("bot", "Por favor, digite 'sim' ou 'não'.");
        return null; // não avança
      }
    },
  },
  instrucoesProcuracao: {
    message: () =>
      `Entendi, vamos iniciar o processo de procuração:\n\
      Acesse o Portal e-CAC\n\
      Menu: “Procurações” > “Cadastrar Procuração”\n\
      Inserir CNPJ: SimplesCon - 54.563.262/0001-93\n\
      Selecionar os serviços correspondentes à Integra Contador\n\
      Validade mínima recomendada: 12 meses - contrato anual ou 1 mês - contrato mensal.\n\
      Após isso, digite 'sim' para confirmar que você já concluiu o processo de procuração.`,
    onReply: (input) => {
      const ok = input.trim().toLowerCase();
      if (positiveAnswer.includes(ok)) {
        return "informarCNPJ";
      } else {
        addMessage("bot", "Sem a procuração ativa, não consigo continuar. Digite 'sim' quando concluir o processo.");
        return null;
      }
    },
  },
  informarCNPJ: {
    message: () => "Perfeito! Agora, por favor, informe o CNPJ da empresa para a qual deseja acessar os serviços.",
    onReply: (input) => {
      userData.cnpj = input;
      return "escolherServico";
    },
  },
  escolherServico: {
    message: () => "Escolha o serviço que deseja realizar na nossa conversa. 1 - Emitir DAS.\n\ 2 - Consultar situação cadastral.\n\ 3 - Enviar Declaração.\n",
    onReply: (input) => {
      userData.servico = input;
      return "aguarde";
    },
  },
  aguarde: {
    message: () => "Muito bem, agora aguarda só um minutinho enquanto estou realizando a sua consulta.",
    auto: async () => {
      // Simula uma chamada assíncrona para processar o serviço
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return `Consulta realizada com sucesso para o CNPJ ${userData.cnpj} no serviço: ${userData.servico}.`;
    },
    next: "finalizar"
  },
  finalizar: {
    message: () => "Tudo pronto! Se precisar de mais alguma coisa, é só chamar. Até mais!",
    auto: async () => {
      // Simula uma pausa final antes de encerrar
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return null; // não há próximo passo
    },
  },
};


const userData = {
  nome: "",
  temProcuracao: null,
  cnpj: "",
  servico: "",
};

let currentStep = "welcome";

function addMessage(sender, text) {
  const div = document.createElement("div");
  const br = document.createElement("br");
  div.classList.add("message", sender);
  div.innerText = text;
  messages.appendChild(div);
  messages.appendChild(br);
  messages.scrollTop = messages.scrollHeight;
}

function processInput(userInput) {
  const step = chatFlow[currentStep];
  if (!step || !step.onReply) return;

  const nextStep = step.onReply(userInput);
  if (!nextStep) return; // aguarda resposta válida

  currentStep = nextStep;
  showCurrentQuestion();
}

async function showCurrentQuestion() {
  const step = chatFlow[currentStep];
  if (!step) return;

  if (step.message) {
    const text = step.message();
    if (text) addMessage("bot", text);
  }

  // Passo automático (sem input do usuário)
  if (step.auto) {
    const response = await step.auto();
    addMessage("bot", response);

    if (step.next) {
      currentStep = step.next;
      showCurrentQuestion(); // encadeia o próximo
    }
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";

  setTimeout(() => processInput(text), 400); // pequena pausa pro UX
});

window.addEventListener("DOMContentLoaded", () => {
  showCurrentQuestion();
});