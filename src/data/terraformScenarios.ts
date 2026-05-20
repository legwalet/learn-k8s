export type TerraformScenarioTask = {
  id: string;
  label: string;
  acceptedCommandIds: string[];
};

export type TerraformScenarioCommand = {
  id: string;
  label: string;
};

export type TerraformScenario = {
  id: string;
  title: string;
  description: string;
  context: string;
  difficulty: "Beginner" | "On-call" | "Production";
  commands: TerraformScenarioCommand[];
  tasks: TerraformScenarioTask[];
};

export type TerraformJourneyStep =
  | { type: "lesson"; lessonId: string }
  | { type: "scenario"; scenarioId: string };

export const terraformScenarios: TerraformScenario[] = [
  {
    id: "workspace-setup",
    title: "Scenario: New workspace setup",
    description: "Initialize Terraform before anyone runs apply.",
    context:
      "You joined a team with an existing repo. Before changing .tf files, initialize providers and confirm the config is valid.",
    difficulty: "Beginner",
    commands: [
      { id: "tf-init", label: "terraform init" },
      { id: "tf-validate", label: "terraform validate" },
      { id: "tf-fmt", label: "terraform fmt" },
    ],
    tasks: [
      {
        id: "run-init",
        label: "Initialize the working directory (terraform init).",
        acceptedCommandIds: ["tf-init"],
      },
      {
        id: "run-validate",
        label: "Validate configuration syntax (terraform validate).",
        acceptedCommandIds: ["tf-validate"],
      },
    ],
  },
  {
    id: "plan-before-apply",
    title: "Scenario: Plan before apply",
    description: "Preview infrastructure changes like production engineers do.",
    context:
      "A PR updates networking resources. You must run a read-only plan and review it with the team before any apply.",
    difficulty: "On-call",
    commands: [
      { id: "tf-plan", label: "terraform plan" },
      { id: "tf-apply", label: "terraform apply" },
      { id: "tf-show", label: "terraform show" },
    ],
    tasks: [
      {
        id: "preview-plan",
        label: "Generate an execution plan (terraform plan).",
        acceptedCommandIds: ["tf-plan"],
      },
      {
        id: "review-show",
        label: "Inspect current state (terraform show).",
        acceptedCommandIds: ["tf-show"],
      },
    ],
  },
  {
    id: "k8-via-terraform",
    title: "Scenario: Kubernetes via Terraform",
    description: "Manage K8s objects as code alongside the cluster.",
    context:
      "Platform team provisions a namespace and deployment with the Kubernetes provider. Plan first, then apply when the change window opens.",
    difficulty: "Production",
    commands: [
      { id: "tf-plan", label: "terraform plan" },
      { id: "tf-apply", label: "terraform apply" },
      { id: "tf-init", label: "terraform init" },
    ],
    tasks: [
      {
        id: "plan-k8",
        label: "Preview Kubernetes resource changes (terraform plan).",
        acceptedCommandIds: ["tf-plan"],
      },
      {
        id: "apply-k8",
        label: "Apply approved changes (terraform apply).",
        acceptedCommandIds: ["tf-apply"],
      },
    ],
  },
];

export const terraformJourneySteps: TerraformJourneyStep[] = [
  { type: "lesson", lessonId: "intro" },
  { type: "scenario", scenarioId: "workspace-setup" },
  { type: "lesson", lessonId: "first-resource" },
  { type: "scenario", scenarioId: "plan-before-apply" },
  { type: "lesson", lessonId: "variables" },
  { type: "lesson", lessonId: "plan-apply" },
  { type: "scenario", scenarioId: "k8-via-terraform" },
];

export const terraformDifficultyOrder: TerraformScenario["difficulty"][] = [
  "Beginner",
  "On-call",
  "Production",
];

export function getTerraformTopicsInTeachingOrder(): TerraformScenario[] {
  const out: TerraformScenario[] = [];
  for (const d of terraformDifficultyOrder) {
    for (const s of terraformScenarios) {
      if (s.difficulty === d) out.push(s);
    }
  }
  return out;
}

export function terraformTopicProgressId(scenarioId: string): string {
  return `terraform-topic:${scenarioId}`;
}

export function getTerraformJourneyStepCompletionId(step: TerraformJourneyStep): string {
  return step.type === "lesson"
    ? `terraform:${step.lessonId}`
    : `terraform-scenario:${step.scenarioId}`;
}

export function isTerraformJourneyStepComplete(
  step: TerraformJourneyStep,
  completedIds: ReadonlySet<string>
): boolean {
  if (step.type === "lesson") {
    return completedIds.has(`terraform:${step.lessonId}`);
  }
  const scenarioId = step.scenarioId;
  return (
    completedIds.has(`terraform-scenario:${scenarioId}`) ||
    completedIds.has(terraformTopicProgressId(scenarioId))
  );
}

export function getTerraformStepHref(step: TerraformJourneyStep): string {
  return step.type === "lesson"
    ? `/learn/terraform/${step.lessonId}`
    : `/assessments/scenarios/${step.scenarioId}`;
}

export function getNextIncompleteTerraformJourneyHref(
  completedIds: ReadonlySet<string> | undefined | null,
  current: TerraformJourneyStep
): string | null {
  const index = terraformJourneySteps.findIndex((step) =>
    step.type === "lesson" && current.type === "lesson"
      ? step.lessonId === current.lessonId
      : step.type === "scenario" && current.type === "scenario"
        ? step.scenarioId === current.scenarioId
        : false
  );
  if (index < 0) return null;
  const ids = completedIds ?? new Set<string>();
  for (let i = index + 1; i < terraformJourneySteps.length; i++) {
    const step = terraformJourneySteps[i];
    if (!isTerraformJourneyStepComplete(step, ids)) {
      return getTerraformStepHref(step);
    }
  }
  return null;
}

export function getTerraformTeachingTopicUnlockState(
  scenarioId: string,
  completedIds: ReadonlySet<string>
): {
  unlocked: boolean;
  previousTopicTitle: string | null;
  previousTopicId: string | null;
} {
  const order = getTerraformTopicsInTeachingOrder();
  const idx = order.findIndex((s) => s.id === scenarioId);
  if (idx < 0) return { unlocked: false, previousTopicTitle: null, previousTopicId: null };
  if (idx === 0) return { unlocked: true, previousTopicTitle: null, previousTopicId: null };
  const prev = order[idx - 1];
  const unlocked = completedIds.has(terraformTopicProgressId(prev.id));
  return {
    unlocked,
    previousTopicTitle: prev.title.replace(/^Scenario:\s*/i, "").trim() || prev.title,
    previousTopicId: prev.id,
  };
}

export function getNextTerraformTeachingTopicHref(currentScenarioId: string): string | null {
  const order = getTerraformTopicsInTeachingOrder();
  const idx = order.findIndex((s) => s.id === currentScenarioId);
  if (idx < 0 || idx >= order.length - 1) return null;
  return `/learn/terraform/topics/${order[idx + 1].id}`;
}

