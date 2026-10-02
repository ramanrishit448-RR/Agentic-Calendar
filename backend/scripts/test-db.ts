import { createAgentMemory } from "../src/config/memory.js";

async function run() {
  try {
    const memory = createAgentMemory();
    const threads = await memory.listThreads({ perPage: 5 });
    for (const t of threads.threads) {
      console.log("Thread:", t.id, t.title);
      const res = await memory.getMessages({ threadId: t.id });
      for (const m of res.messages.slice(-10)) {
        console.log("Role:", m.role);
        console.log("Content:", JSON.stringify(m.content, null, 2));
      }
    }
  } catch (e) {
    console.error(e);
  } 
}
run();
