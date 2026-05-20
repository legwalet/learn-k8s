import { kubernetesScenarios, type KubernetesScenario } from "@/data/kubernetesScenarios";
import { terraformScenarios, type TerraformScenario } from "@/data/terraformScenarios";

export type AnyScenario = KubernetesScenario | TerraformScenario;

export function findScenarioById(scenarioId: string): {
  track: "kubernetes" | "terraform";
  scenario: AnyScenario;
} | null {
  const k8 = kubernetesScenarios.find((s) => s.id === scenarioId);
  if (k8) return { track: "kubernetes", scenario: k8 };
  const tf = terraformScenarios.find((s) => s.id === scenarioId);
  if (tf) return { track: "terraform", scenario: tf };
  return null;
}

export function getScenarioJourneyId(track: "kubernetes" | "terraform", scenarioId: string): string {
  return track === "terraform" ? `terraform-scenario:${scenarioId}` : `scenario:${scenarioId}`;
}
