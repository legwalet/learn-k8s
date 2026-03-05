# K8 Learn — Learn Kubernetes Interactively

A site for **teaching Kubernetes (K8s)** with interactive lessons, a simulated `kubectl` terminal, and YAML examples. Optional coding track for JavaScript/Node.js with a live in-browser terminal.

## What you get

- **Learn Kubernetes** — Core concepts, `kubectl`, Pods, Deployments, and Services. Simulated terminal to practice `kubectl get pods`, `kubectl get nodes`, etc., and copy YAML for use with minikube or kind.
- **Learn to Code** — JavaScript lessons with a real in-browser Node.js terminal ([WebContainers](https://webcontainers.io)). Useful before or alongside the Kubernetes track.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Browser support

- **Coding (live terminal):** Works best in **Chrome** or **Edge**. WebContainers need a supported browser; if it doesn’t boot, you’ll see a message.
- **Kubernetes (simulated terminal):** Works in any modern browser.

## Project structure

- `src/app/` — Next.js App Router (home, learn/coding, learn/kubernetes).
- `src/components/` — CodeEditor (Monaco), WebContainerTerminal (live Node.js), SimulatedK8Terminal (kubectl simulation).
- `src/data/lessons.ts` — Lesson content and simulated `kubectl` output.

You can add more lessons in `lessons.ts` and new pages under `src/app/learn/`.
