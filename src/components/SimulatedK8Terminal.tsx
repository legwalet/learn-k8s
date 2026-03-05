"use client";

import { getSimulatedKubectlOutput } from "@/data/lessons";
import SimpleTerminal from "./SimpleTerminal";

const PROMPT = "$ ";

type SimulatedK8TerminalProps = {
  className?: string;
  onCommand?: (command: string) => void;
};

export default function SimulatedK8Terminal({
  className = "",
  onCommand,
}: SimulatedK8TerminalProps) {
  return (
    <SimpleTerminal
      className={className}
      label="Terminal (simulated — try kubectl commands)"
      prompt={PROMPT}
      initialLines={[
        "Kubernetes (simulated) terminal.",
        "Try: kubectl get pods | kubectl get nodes | kubectl get deployments",
        "",
      ]}
      onLine={(line) => {
        onCommand?.(line);
        return getSimulatedKubectlOutput(line);
      }}
    />
  );
}
