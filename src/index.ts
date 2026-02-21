import "dotenv/config";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import {
  END,
  MessagesValue,
  START,
  StateGraph,
  StateSchema,
} from "@langchain/langgraph";

const groqKey = process.env.GROQ_API_KEY;
if (!groqKey) {
  console.error("Falta GROQ_API_KEY en .env");
  process.exit(1);
}

const ConversationState = new StateSchema({
  messages: MessagesValue,
});

const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const temperature = process.env.TEMPERATURE
  ? Number(process.env.TEMPERATURE)
  : 0;

const llm = new ChatGroq({
  apiKey: groqKey,
  model,
  temperature,
});

const processNode = async (state: { messages: BaseMessage[] }) => {
  const last = state.messages.at(-1);
  const text = last?.content
    ? String(last.content)
    : "Hola, ¿qué es LangGraph?";

  try {
    const aiMsg = await llm.invoke(text);
    return { messages: [aiMsg] };
  } catch (error) {
    const errorText = (error as Error).message ?? String(error);
    return {
      messages: [new AIMessage(`Error al consultar el modelo: ${errorText}`)],
    };
  }
};

const app = new StateGraph(ConversationState)
  .addNode("process", processNode)
  .addEdge(START, "process")
  .addEdge("process", END)
  .compile();

const run = async () => {
  const cliText = process.argv.slice(2).join(" ").trim();
  const initial = cliText ? [new HumanMessage(cliText)] : [];

  const result = await app.invoke({ messages: initial });
  const last = result.messages.at(-1);

  console.log(`\n(model=${model}, temperature=${temperature})`);
  console.log("\nIA:", last?.content, "\n");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
