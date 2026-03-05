import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  const { context, messages } = (await req.json()) as {
    context?: string;
    messages?: ChatMessage[];
  };

  const apiKey = process.env.OPENAI_API_KEY;
  const localBaseUrl = process.env.LOCAL_LLM_BASE_URL; // e.g. http://localhost:11434/v1

  // If neither a remote key nor a local LLM base URL is configured, fall back to simple hints.
  if (!apiKey && !localBaseUrl) {
    const lastUser = messages?.slice().reverse().find((m) => m.role === "user");
    const question = lastUser?.content ?? "";
    const rawContext =
      context ??
      "You are on a learning page in K8 Learn. Use the text on this page to answer as best you can.";

    // Try to pull out just the instructions / most relevant part so we don't spam the full context
    let shortHint = rawContext;
    const marker = "Instructions (markdown-like):";
    if (rawContext.includes(marker)) {
      shortHint = rawContext.split(marker)[1]?.trim() || rawContext;
    }
    if (shortHint.length > 280) {
      shortHint = shortHint.slice(0, 280) + "…";
    }

    const lowerQ = question.toLowerCase().trim();

    // Very small offline knowledge so the tutor feels more "interactive" even without an API key.
    if (lowerQ) {
      // How to delete / destroy a Pod
      if (
        (lowerQ.includes("destroy") || lowerQ.includes("delete") || lowerQ.includes("remove")) &&
        lowerQ.includes("pod")
      ) {
        const reply =
          "To destroy (delete) a Pod in Kubernetes, use:\n\n" +
          "- `kubectl delete pod <pod-name>` — deletes a single Pod\n" +
          "- `kubectl delete pod hello-k8` — for this lesson's example Pod\n\n" +
          "If the Pod is managed by a Deployment, Kubernetes will create a new Pod to keep the desired replica count. " +
          "In that case you usually delete or scale the **Deployment** instead:\n\n" +
          "- `kubectl delete deployment <deployment-name>`\n" +
          "- or `kubectl scale deployment <deployment-name> --replicas=0`";
        return NextResponse.json({ reply });
      }

      // Basic help for "how do I create/apply this YAML?"
      if (
        (lowerQ.includes("apply") || lowerQ.includes("create")) &&
        (lowerQ.includes("yaml") || lowerQ.includes("pod"))
      ) {
        const reply =
          "To create this resource from YAML on a real cluster:\n\n" +
          "1. Save the YAML into a file, for example `pod.yaml`.\n" +
          "2. From your terminal (connected to a cluster), run:\n\n" +
          "   - `kubectl apply -f pod.yaml`\n\n" +
          "3. Check that the Pod is running with:\n\n" +
          "   - `kubectl get pods`\n\n" +
          "The in-browser terminal here is only a simulator; it shows **example output**, but real changes happen only when you run these commands against a real Kubernetes cluster (minikube, kind, etc.).";
        return NextResponse.json({ reply });
      }
    }
    const isGreeting =
      lowerQ === "hi" ||
      lowerQ === "hello" ||
      lowerQ === "hey" ||
      lowerQ.startsWith("hi ") ||
      lowerQ.startsWith("hello ") ||
      lowerQ.startsWith("hey ");

    const fallbackReply = isGreeting
      ? "Hi! I'm your local tutor. I can't reach the online AI service yet, but you can ask me about what this lesson is showing and I'll give you a short hint from the page text.\n\nFor this lesson, a good next step is:\n" +
        shortHint
      : question
        ? `I can't call the online AI service right now, but based on this lesson here is a short hint related to your question:\n\n${shortHint}`
        : "I can't call the online AI service right now. Read through the current lesson instructions and try the example commands — that will usually unlock the next step.";

    return NextResponse.json({ reply: fallbackReply });
  }

  const userContent =
    messages?.map((m) => `${m.role === "user" ? "User" : "Tutor"}: ${m.content}`).join("\n") ?? "";

  const usingLocal = !!localBaseUrl;
  const baseUrl = usingLocal
    ? `${localBaseUrl!.replace(/\/$/, "")}/chat/completions`
    : "https://api.openai.com/v1/chat/completions";

  const model = usingLocal ? process.env.LOCAL_LLM_MODEL || "llama3" : "gpt-4.1-mini";

  const body = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are an assistant helping a beginner learn Kubernetes and JavaScript inside a small teaching app. " +
          "Give short, clear explanations, tie answers back to the current lesson context, and suggest concrete next steps. " +
          "When relevant, show example kubectl commands or short code snippets.",
      },
      {
        role: "user",
        content:
          `Lesson context:\n${context ?? "No extra context."}\n\nConversation so far:\n` + userContent,
      },
    ],
    max_tokens: 400,
    temperature: 0.4,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (!usingLocal && apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    return NextResponse.json(
      { reply: "The AI tutor request failed. Check server logs and API key configuration.", error: text },
      { status: 500 }
    );
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const reply = json.choices?.[0]?.message?.content ?? "I could not generate a response.";

  return NextResponse.json({ reply });
}

