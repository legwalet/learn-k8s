export type Lesson = {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  instructions: string;
  hint?: string;
};

export const codingLessons: Lesson[] = [
  {
    id: "hello",
    title: "Hello, World",
    description: "Run your first JavaScript in the terminal.",
    code: `console.log("Hello, World!");
`,
    language: "javascript",
    instructions: `You just joined a team and need to prove your environment works.

Click **Run** to execute the code, or in the terminal type:
\`node index.js\`

For the assessment on this page to pass, your program must actually print \`Hello, World!\` to the console.`,
    hint: "The editor already has the code. Just hit Run or run node index.js in the terminal.",
  },
  {
    id: "variables",
    title: "Variables",
    description: "Store values and print them.",
    code: `const name = "K8 Learner";
const count = 3;
console.log("Hello,", name);
console.log("Count is", count);
`,
    language: "javascript",
    instructions: `Imagine you're writing a small script to report how many Pods are running in a cluster for a specific team.

Use \`const\` to create variables for a name and a count (for example, a team name and number of Pods). Log both so the output clearly shows who the report is for and the count.

The assessment on this page checks that you both **declare** the variables and **log** them.`,
  },
  {
    id: "functions",
    title: "Functions",
    description: "Write a function and call it.",
    code: `function greet(name) {
  return "Hello, " + name + "!";
}

console.log(greet("Kubernetes"));
console.log(greet("World"));
`,
    language: "javascript",
    instructions: `You are adding a friendly greeting helper to a dashboard that DevOps teams will see.

Define a function with \`function name(args) { ... }\`. Call it with \`greet("something")\`. Run and see the output.

To pass the coding test, your function must be called at least twice with different names.`,
  },
];

export const kubernetesLessons: Lesson[] = [
  {
    id: "intro",
    title: "What is Kubernetes?",
    description: "Core concepts in 60 seconds.",
    code: `# Kubernetes (K8s) runs your containers at scale.
# You describe WHAT you want; K8s figures out HOW.

# Key concepts:
# - Pod: smallest unit (one or more containers)
# - Deployment: desired state for your app
# - Service: stable network access to pods
# - kubectl: CLI to talk to the cluster
`,
    language: "yaml",
    instructions: `Kubernetes is a container orchestrator. You declare desired state (e.g. "3 replicas of my app") and it keeps the cluster matching that.

In the terminal below, try these commands to see simulated output from a real cluster.`,
    hint: "Type: kubectl get pods",
  },
  {
    id: "kubectl-get",
    title: "kubectl get",
    description: "List resources in the cluster.",
    code: `# Commands you can try in the terminal:
# kubectl get pods
# kubectl get nodes
# kubectl get deployments
# kubectl get services
`,
    language: "yaml",
    instructions: `You are on call and someone reports "the app feels slow". Your first job is to **inspect the cluster safely** without changing anything.

\`kubectl get <resource>\` lists resources. Common resources: \`pods\`, \`nodes\`, \`deployments\`, \`services\`, \`namespaces\`.

Type in the terminal (then press Enter):
- \`kubectl get pods\`
- \`kubectl get nodes\`
- \`kubectl get deployments\`

The terminal is simulated for this lesson — in a real cluster you'd see your own resources.`,
  },
  {
    id: "pod-yaml",
    title: "Your first Pod YAML",
    description: "Define a Pod with a container.",
    code: `apiVersion: v1
kind: Pod
metadata:
  name: hello-k8
  labels:
    app: hello
spec:
  containers:
  - name: hello
    image: nginx:alpine
    ports:
    - containerPort: 80
`,
    language: "yaml",
    instructions: `This YAML defines a Pod named \`hello-k8\` running one container (nginx). To create it on a real cluster you would run:

\`kubectl apply -f pod.yaml\`

We don't run real Kubernetes in the browser, but you can copy this file and use it with minikube or kind locally.`,
  },
  {
    id: "deployment-yaml",
    title: "Deployments",
    description: "Run multiple replicas and manage desired state.",
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
`,
    language: "yaml",
    instructions: `A **Deployment** tells Kubernetes how many copies (replicas) of your app to run and how to update them. Unlike a bare Pod, a Deployment survives node failures and supports rolling updates.

Key fields: \`replicas\`, \`selector\`, and \`template\` (the Pod spec). Use \`kubectl get deployments\` to see them.`,
    hint: "Try: kubectl get deployments",
  },
  {
    id: "service-yaml",
    title: "Services",
    description: "Expose your app with a stable network endpoint.",
    code: `apiVersion: v1
kind: Service
metadata:
  name: web
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
`,
    language: "yaml",
    instructions: `A **Service** gives your pods a stable DNS name and IP. Other workloads in the cluster can reach your app at \`web\` (or \`web.default.svc.cluster.local\`). \`selector\` matches pods by labels; \`port\` and \`targetPort\` define the mapping.

Type \`kubectl get services\` in the terminal to see example output.`,
    hint: "Try: kubectl get services",
  },
];

function cleanKubectlInput(cmd: string): string {
  let trimmed = cmd.trim();
  // Many learners copy the leading "$" prompt; be forgiving and strip it.
  if (trimmed.startsWith("$")) {
    trimmed = trimmed.slice(1).trim();
  }
  return trimmed;
}

function simulateKubectl(cmd: string): string {
  const cleaned = cleanKubectlInput(cmd);
  const c = cleaned.toLowerCase();

  // Lightly simulate a few common shell commands so the terminal feels less "broken".
  if (c === "ls") {
    return `pod.yaml
deployment.yaml
service.yaml`;
  }
  if (c === "pwd") {
    return "/workspace";
  }
  if (c === "cat pod.yaml") {
    return `# Example contents of pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: hello-k8
  labels:
    app: hello`;
  }

  if (c === "kubectl apply -f pod.yaml") {
    return `pod/hello-k8 created (simulated)

Next steps:
- Run: kubectl get pods
- Then, on a real cluster, you would use kubectl describe pod hello-k8 to inspect it.`;
  }

  if (c === "clear") {
    return "Screen cleared (simulated). Type kubectl get pods to continue.";
  }
  if (c === "kubectl get pods" || c === "kubectl get pod") {
    return `NAME         READY   STATUS    RESTARTS   AGE
hello-k8     1/1     Running   0          2m
web-abc12    1/1     Running   0          5m`;
  }
  if (c === "kubectl get nodes") {
    return `NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   10d   v1.28.0`;
  }
  if (c === "kubectl get deployments" || c === "kubectl get deployment") {
    return `NAME   READY   UP-TO-DATE   AVAILABLE   AGE
web    3/3     3            3           5m`;
  }
  if (c === "kubectl get services" || c === "kubectl get svc") {
    return `NAME   TYPE        CLUSTER-IP     EXTERNAL-IP   PORT(S)   AGE
web    ClusterIP   10.96.1.100   <none>        80/TCP    5m`;
  }
  if (c === "kubectl get namespaces" || c === "kubectl get ns") {
    return `NAME              STATUS   AGE
default           Active   10d
kube-system       Active   10d
kube-public       Active   10d`;
  }
  if (c.startsWith("kubectl ")) {
    return `(Simulated output for: ${cleaned})\nRun a real cluster (e.g. minikube, kind) to see actual output.`;
  }
  return `Unknown command in this simulator.

Try:
- kubectl get pods
- kubectl get nodes
- kubectl get deployments

For real Linux commands (ls, cat, touch, etc.), use the terminal in the "Learn to Code" section on the home page.`;
}

export function getSimulatedKubectlOutput(cmd: string): string {
  return simulateKubectl(cmd);
}
