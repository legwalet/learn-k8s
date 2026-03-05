"use client";

import { useEffect, useState } from "react";

type AreaId = "cluster" | "nodes" | "pods" | "deploymentsServices";

type CommandId =
  | "get-nodes"
  | "get-pods"
  | "describe-node"
  | "get-deployments-svc";

type K8ArchitectureVizProps = {
  onClose: () => void;
  /** Optional: last kubectl-style command run in the simulated terminal */
  lastCommand?: string | null;
};

const COMMANDS: {
  id: CommandId;
  label: string;
  description: string;
  suggestedArea: AreaId;
}[] = [
  {
    id: "get-nodes",
    label: "kubectl get nodes -o wide",
    description: "See worker nodes, their internal IPs, and status.",
    suggestedArea: "nodes",
  },
  {
    id: "get-pods",
    label: "kubectl get pods -o wide",
    description: "See which node each pod is running on.",
    suggestedArea: "pods",
  },
  {
    id: "describe-node",
    label: "kubectl describe node <node-name>",
    description: "Inspect node capacity, labels, and scheduled pods.",
    suggestedArea: "nodes",
  },
  {
    id: "get-deployments-svc",
    label: "kubectl get deployments,svc",
    description: "See deployments and services that create/expose pods.",
    suggestedArea: "deploymentsServices",
  },
];

function matchCommandToId(raw?: string | null): CommandId | null {
  if (!raw) return null;
  const line = raw.trim().toLowerCase();
  if (!line.startsWith("kubectl")) return null;
  if (line.includes("get nodes")) return "get-nodes";
  if (line.includes("get pods")) return "get-pods";
  if (line.includes("describe node")) return "describe-node";
  if (line.includes("get deployments") || line.includes("get deployment") || line.includes("get svc")) {
    return "get-deployments-svc";
  }
  return null;
}

export default function K8ArchitectureViz({ onClose, lastCommand }: K8ArchitectureVizProps) {
  const [activeArea, setActiveArea] = useState<AreaId | null>(null);
  const [activeCommandId, setActiveCommandId] = useState<CommandId | null>(null);

  useEffect(() => {
    const matched = matchCommandToId(lastCommand);
    if (!matched) return;
    const cmd = COMMANDS.find((c) => c.id === matched);
    if (!cmd) return;
    setActiveCommandId(matched);
    setActiveArea(cmd.suggestedArea);
  }, [lastCommand]);

  const activeCommand = COMMANDS.find((c) => c.id === activeCommandId) ?? null;

  const setFromCommand = (commandId: CommandId) => {
    const cmd = COMMANDS.find((c) => c.id === commandId);
    if (!cmd) return;
    setActiveCommandId(commandId);
    setActiveArea(cmd.suggestedArea);
  };

  const handleDropOnArea = (areaId: AreaId, event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const commandId = event.dataTransfer.getData("command-id") as CommandId | "";
    if (!commandId) return;
    setActiveCommandId(commandId);
    setActiveArea(areaId);
  };

  const makeAreaClasses = (areaId: AreaId) =>
    `rounded-xl border bg-[#161b22] p-4 transition-colors ${
      activeArea === areaId
        ? "border-[#3fb950] shadow-[0_0_0_1px_rgba(63,185,80,0.4)]"
        : "border-gray-700"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-3xl w-full mx-4 rounded-2xl border border-gray-700 bg-[#0d1117] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-gray-600 px-2 py-0.5 text-xs text-gray-300 hover:border-gray-400 hover:text-white"
        >
          Close
        </button>

        <div className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Kubernetes cluster visualization
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              This is a conceptual map of a small cluster and how common{" "}
              <code className="text-[#3fb950]">kubectl</code> commands let you
              see different parts of it.
            </p>
            {lastCommand && (
              <p className="mt-2 text-xs text-gray-400">
                Last command you ran in the terminal:{" "}
                <span className="inline-flex items-center rounded-full border border-gray-700 bg-[#161b22] px-2 py-0.5 font-mono text-[11px] text-[#3fb950]">
                  {lastCommand}
                </span>
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr),minmax(0,1.2fr)] items-start">
            <div className="space-y-4">
              <div
                className={makeAreaClasses("cluster")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnArea("cluster", e)}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Cluster
                </p>
                <div className="rounded-lg border border-[#58a6ff]/40 bg-[#0d1117] p-4">
                  <p className="text-sm font-medium text-[#58a6ff]">
                    k8s-cluster
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Control plane + worker nodes. Think of this as the whole
                    Kubernetes world.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className={makeAreaClasses("nodes")}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnArea("nodes", e)}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Worker nodes
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                      <p className="text-sm font-medium text-white">node-1</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Runs pods (your workloads).
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                      <p className="text-sm font-medium text-white">node-2</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Another worker node in the same cluster.
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    See nodes with{" "}
                    <code className="text-[#3fb950]">kubectl get nodes</code>
                  </p>
                </div>

                <div
                  className={makeAreaClasses("pods")}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDropOnArea("pods", e)}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Pods & containers
                  </p>
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                      <p className="text-sm font-medium text-white">
                        pod: api-7c9d45
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Contains 1–N containers (your app images).
                      </p>
                    </div>
                    <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                      <p className="text-sm font-medium text-white">
                        pod: web-5f6b22
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Another pod scheduled onto a node.
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    See pods with{" "}
                    <code className="text-[#3fb950]">kubectl get pods</code>
                  </p>
                </div>
              </div>

              <div
                className={makeAreaClasses("deploymentsServices")}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDropOnArea("deploymentsServices", e)}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Deployments & services
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                    <p className="text-sm font-medium text-white">
                      deployment: web
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Manages replica pods and rolling updates.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      <code className="text-[#3fb950]">
                        kubectl get deployments
                      </code>
                    </p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-[#0d1117] p-2">
                    <p className="text-sm font-medium text-white">
                      service: web-svc
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Stable virtual IP that load-balances to pods.
                    </p>
                    <p className="mt-2 text-xs text-gray-400">
                      <code className="text-[#3fb950]">
                        kubectl get services
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-[#161b22] p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Drag &amp; drop kubectl commands
              </p>

              <div className="flex flex-wrap gap-2">
                {COMMANDS.map((cmd) => (
                  <button
                    key={cmd.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("command-id", cmd.id);
                    }}
                    onClick={() => setFromCommand(cmd.id)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-mono transition-colors ${
                      activeCommandId === cmd.id
                        ? "border-[#3fb950] bg-[#18291f] text-[#3fb950]"
                        : "border-gray-700 bg-[#0d1117] text-gray-300 hover:border-gray-500 hover:text-white"
                    }`}
                  >
                    <span className="text-[10px]">⇄</span>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-1 text-xs text-gray-300">
                {activeCommand ? (
                  <>
                    <p className="font-semibold text-gray-200">
                      You&apos;re exploring:{" "}
                      <span className="font-mono text-[#3fb950]">
                        {activeCommand.label}
                      </span>
                    </p>
                    <p className="text-gray-400">{activeCommand.description}</p>
                    {activeArea === "cluster" && (
                      <p className="text-gray-500">
                        This command helps you see the overall cluster health.
                      </p>
                    )}
                    {activeArea === "nodes" && (
                      <p className="text-gray-500">
                        Focus on the worker nodes section on the left – that&apos;s what this command is about.
                      </p>
                    )}
                    {activeArea === "pods" && (
                      <p className="text-gray-500">
                        Look at the pods &amp; containers cards – they represent the rows you see in{" "}
                        <code className="text-[#3fb950]">kubectl get pods</code>.
                      </p>
                    )}
                    {activeArea === "deploymentsServices" && (
                      <p className="text-gray-500">
                        Deployments and services sit above pods; this command shows the controllers that manage and expose them.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">
                    Drag a command onto a part of the diagram, or click a command chip to highlight where it fits.
                  </p>
                )}
              </div>

              <p className="pt-2 text-xs text-gray-500 border-t border-gray-800">
                Tip: run these commands in a real cluster (minikube, kind, or a cloud cluster) and compare the output
                to this diagram to train your mental model.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

