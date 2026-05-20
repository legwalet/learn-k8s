"use client";

import { getSimulatedTerraformOutput } from "@/data/terraformLessons";
import SimpleTerminal from "./SimpleTerminal";

const PROMPT = "$ ";

type SimulatedTerraformTerminalProps = {
  className?: string;
  onCommand?: (command: string) => void;
};

export default function SimulatedTerraformTerminal({
  className = "",
  onCommand,
}: SimulatedTerraformTerminalProps) {
  return (
    <SimpleTerminal
      className={className}
      label="Terminal (simulated — try terraform commands)"
      prompt={PROMPT}
      initialLines={[
        "Terraform (simulated) terminal.",
        "Try: terraform init | terraform plan | terraform apply",
        "",
      ]}
      onLine={(line) => {
        onCommand?.(line);
        return getSimulatedTerraformOutput(line);
      }}
    />
  );
}
