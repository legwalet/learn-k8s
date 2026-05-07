export type ScenarioTask = {
  id: string;
  label: string;
  acceptedCommandIds: string[];
};

export type ScenarioCommand = {
  id: string;
  label: string;
};

export type KubernetesScenario = {
  id: string;
  title: string;
  description: string;
  context: string;
  difficulty: "Beginner" | "On-call" | "Production" | "Security/Cost";
  commands: ScenarioCommand[];
  tasks: ScenarioTask[];
};

export type KubernetesJourneyStep =
  | { type: "lesson"; lessonId: string }
  | { type: "scenario"; scenarioId: string };

export const kubernetesScenarios: KubernetesScenario[] = [
  {
    id: "cluster-health-check",
    title: "Scenario: Cluster health check",
    description: "You are on call and need a fast cluster status snapshot.",
    context:
      "Production latency has spiked. Before making changes, quickly inspect nodes and pods to confirm basic cluster health.",
    difficulty: "Beginner",
    commands: [
      { id: "kubectl-get-nodes", label: "kubectl get nodes" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-get-namespaces", label: "kubectl get namespaces" },
    ],
    tasks: [
      {
        id: "check-nodes",
        label: "Check if worker nodes are Ready.",
        acceptedCommandIds: ["kubectl-get-nodes"],
      },
      {
        id: "check-pods",
        label: "List running pods to confirm workloads are up.",
        acceptedCommandIds: ["kubectl-get-pods"],
      },
    ],
  },
  {
    id: "on-call-triage",
    title: "Scenario: On-call triage",
    description: "Investigate a user report that the app is timing out.",
    context:
      "An incident just started. You need to verify deployments and services before escalating to another team.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-get-deployments", label: "kubectl get deployments" },
      { id: "kubectl-get-services", label: "kubectl get services" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
    ],
    tasks: [
      {
        id: "check-deployments",
        label: "Verify desired replicas are available.",
        acceptedCommandIds: ["kubectl-get-deployments"],
      },
      {
        id: "check-services",
        label: "Confirm service endpoints are present.",
        acceptedCommandIds: ["kubectl-get-services"],
      },
    ],
  },
  {
    id: "pod-recovery",
    title: "Scenario: Pod recovery",
    description: "A pod was deleted accidentally and must be recreated safely.",
    context:
      "A teammate removed a pod in production. Re-apply the manifest and verify replacement pods are running.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-apply-pod", label: "kubectl apply -f pod.yaml" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-get-events", label: "kubectl get events" },
    ],
    tasks: [
      {
        id: "recreate-pod",
        label: "Recreate the pod from manifest.",
        acceptedCommandIds: ["kubectl-apply-pod"],
      },
      {
        id: "verify-pod",
        label: "Verify the pod is running again.",
        acceptedCommandIds: ["kubectl-get-pods"],
      },
    ],
  },
  {
    id: "crashloopbackoff-debug",
    title: "Scenario: CrashLoopBackOff debug",
    description: "A critical pod keeps restarting and user traffic is failing.",
    context:
      "You need to diagnose a crashing pod quickly by inspecting logs and pod events before changing any config.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-logs-pod", label: "kubectl logs <pod>" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
    ],
    tasks: [
      {
        id: "spot-crashing-pod",
        label: "Find which pod is crashing.",
        acceptedCommandIds: ["kubectl-get-pods"],
      },
      {
        id: "inspect-crash-reason",
        label: "Inspect logs/events to identify root cause.",
        acceptedCommandIds: ["kubectl-logs-pod", "kubectl-describe-pod"],
      },
    ],
  },
  {
    id: "service-not-reachable",
    title: "Scenario: Service not reachable",
    description: "Your service is exposed but requests time out.",
    context:
      "Check if service selectors match pod labels and ports before escalating to networking teams.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-get-services", label: "kubectl get services" },
      { id: "kubectl-get-pods-labels", label: "kubectl get pods --show-labels" },
      { id: "kubectl-describe-service", label: "kubectl describe svc <service>" },
    ],
    tasks: [
      {
        id: "inspect-service",
        label: "Inspect the service configuration.",
        acceptedCommandIds: ["kubectl-get-services", "kubectl-describe-service"],
      },
      {
        id: "verify-selector-match",
        label: "Verify pod labels match the service selector.",
        acceptedCommandIds: ["kubectl-get-pods-labels"],
      },
    ],
  },
  {
    id: "pod-pending-capacity",
    title: "Scenario: Pod stuck Pending",
    description: "New pod never schedules to any node.",
    context:
      "A deployment rollout is blocked. Determine whether resource requests or scheduling constraints are too strict.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
      { id: "kubectl-get-nodes", label: "kubectl get nodes" },
    ],
    tasks: [
      {
        id: "confirm-pending-status",
        label: "Confirm the pod is Pending.",
        acceptedCommandIds: ["kubectl-get-pods"],
      },
      {
        id: "check-scheduling-events",
        label: "Inspect scheduling failure reasons.",
        acceptedCommandIds: ["kubectl-describe-pod"],
      },
    ],
  },
  {
    id: "node-memory-pressure",
    title: "Scenario: Node memory pressure",
    description: "Pods are being OOMKilled during peak traffic.",
    context:
      "You need to identify memory pressure and validate resource constraints before updating limits.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
      { id: "kubectl-top-nodes", label: "kubectl top nodes" },
    ],
    tasks: [
      {
        id: "detect-oom",
        label: "Identify pods terminated with OOMKilled.",
        acceptedCommandIds: ["kubectl-describe-pod"],
      },
      {
        id: "validate-node-memory",
        label: "Validate node memory pressure.",
        acceptedCommandIds: ["kubectl-top-nodes"],
      },
    ],
  },
  {
    id: "failed-rollout-recovery",
    title: "Scenario: Rolling deployment fails",
    description: "A new deployment version is unhealthy in production.",
    context:
      "Roll out introduced errors. You must inspect rollout status and prepare rollback safely.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-rollout-status", label: "kubectl rollout status deployment <name>" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-rollout-undo", label: "kubectl rollout undo deployment <name>" },
    ],
    tasks: [
      {
        id: "check-rollout-health",
        label: "Check current rollout health.",
        acceptedCommandIds: ["kubectl-rollout-status"],
      },
      {
        id: "perform-safe-rollback",
        label: "Rollback to the previous stable revision.",
        acceptedCommandIds: ["kubectl-rollout-undo"],
      },
    ],
  },
  {
    id: "app-before-db-ready",
    title: "Scenario: App starts before DB",
    description: "Backend containers crash because database is not yet ready.",
    context:
      "You are asked to prove startup ordering issues and gather evidence for using init containers/readiness probes.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-logs-pod", label: "kubectl logs <pod>" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
    ],
    tasks: [
      {
        id: "capture-startup-errors",
        label: "Capture startup errors from backend logs.",
        acceptedCommandIds: ["kubectl-logs-pod"],
      },
      {
        id: "confirm-restart-pattern",
        label: "Confirm repeated restart pattern/events.",
        acceptedCommandIds: ["kubectl-describe-pod", "kubectl-get-pods"],
      },
    ],
  },
  {
    id: "configmap-driven-config",
    title: "Scenario: Config changes need redeploy",
    description: "Config values are hardcoded and changes are risky.",
    context:
      "You want app settings managed separately from image builds using ConfigMaps.",
    difficulty: "Beginner",
    commands: [
      { id: "kubectl-create-configmap", label: "kubectl create configmap app-config --from-literal=ENV=prod" },
      { id: "kubectl-get-configmaps", label: "kubectl get configmaps" },
      { id: "kubectl-describe-configmap", label: "kubectl describe configmap app-config" },
    ],
    tasks: [
      {
        id: "create-configmap",
        label: "Create a ConfigMap for environment config.",
        acceptedCommandIds: ["kubectl-create-configmap"],
      },
      {
        id: "verify-configmap",
        label: "Verify the ConfigMap exists and contains keys.",
        acceptedCommandIds: ["kubectl-get-configmaps", "kubectl-describe-configmap"],
      },
    ],
  },
  {
    id: "secrets-management",
    title: "Scenario: Secrets in plain text",
    description: "Credentials were committed in YAML by mistake.",
    context:
      "Migrate sensitive values to Kubernetes Secrets and validate they are stored as secret objects.",
    difficulty: "Security/Cost",
    commands: [
      { id: "kubectl-create-secret", label: "kubectl create secret generic db-secret --from-literal=password=1234" },
      { id: "kubectl-get-secrets", label: "kubectl get secrets" },
      { id: "kubectl-describe-secret", label: "kubectl describe secret db-secret" },
    ],
    tasks: [
      {
        id: "create-secret",
        label: "Create secret object for DB password.",
        acceptedCommandIds: ["kubectl-create-secret"],
      },
      {
        id: "verify-secret",
        label: "Verify secret object exists.",
        acceptedCommandIds: ["kubectl-get-secrets", "kubectl-describe-secret"],
      },
    ],
  },
  {
    id: "external-traffic-exposure",
    title: "Scenario: External traffic access",
    description: "Users outside the cluster need access to the app.",
    context:
      "Decide whether service exposure is configured for public traffic and confirm current service type.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-services", label: "kubectl get services" },
      { id: "kubectl-describe-service", label: "kubectl describe svc <service>" },
      { id: "kubectl-get-ingress", label: "kubectl get ingress" },
    ],
    tasks: [
      {
        id: "inspect-exposure",
        label: "Inspect current service exposure type.",
        acceptedCommandIds: ["kubectl-get-services", "kubectl-describe-service"],
      },
      {
        id: "check-ingress",
        label: "Check whether Ingress resources exist.",
        acceptedCommandIds: ["kubectl-get-ingress"],
      },
    ],
  },
  {
    id: "uneven-pod-load",
    title: "Scenario: Uneven load across pods",
    description: "One pod is overloaded while others are idle.",
    context:
      "Traffic imbalance is reported. Validate replica count and scale deployment safely.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-deployments", label: "kubectl get deployments" },
      { id: "kubectl-scale-deployment", label: "kubectl scale deployment app --replicas=3" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
    ],
    tasks: [
      {
        id: "check-replica-state",
        label: "Check current replica state.",
        acceptedCommandIds: ["kubectl-get-deployments"],
      },
      {
        id: "scale-replicas",
        label: "Scale deployment to spread load.",
        acceptedCommandIds: ["kubectl-scale-deployment"],
      },
    ],
  },
  {
    id: "hpa-autoscaling",
    title: "Scenario: Need auto scaling",
    description: "Traffic spikes overload static replica counts.",
    context:
      "Set up autoscaling thresholds so workloads can scale based on CPU demand.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-autoscale", label: "kubectl autoscale deployment app --cpu-percent=70 --min=2 --max=10" },
      { id: "kubectl-get-hpa", label: "kubectl get hpa" },
      { id: "kubectl-describe-hpa", label: "kubectl describe hpa app" },
    ],
    tasks: [
      {
        id: "create-hpa",
        label: "Create HPA policy for the deployment.",
        acceptedCommandIds: ["kubectl-autoscale"],
      },
      {
        id: "verify-hpa",
        label: "Verify HPA object and thresholds.",
        acceptedCommandIds: ["kubectl-get-hpa", "kubectl-describe-hpa"],
      },
    ],
  },
  {
    id: "logs-observability",
    title: "Scenario: Logs are hard to track",
    description: "Troubleshooting takes too long without centralized logs.",
    context:
      "Demonstrate current log access pattern and gather logs needed to justify centralized logging setup.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-logs-pod", label: "kubectl logs <pod>" },
      { id: "kubectl-logs-follow", label: "kubectl logs -f <pod>" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
    ],
    tasks: [
      {
        id: "list-log-sources",
        label: "List available pod log sources.",
        acceptedCommandIds: ["kubectl-get-pods"],
      },
      {
        id: "stream-live-logs",
        label: "Stream live logs from target pod.",
        acceptedCommandIds: ["kubectl-logs-follow", "kubectl-logs-pod"],
      },
    ],
  },
  {
    id: "service-to-service-networking",
    title: "Scenario: Pods cannot talk to each other",
    description: "Microservices communication fails intermittently.",
    context:
      "You need to verify service discovery and investigate potential network policy blocks.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-services", label: "kubectl get services" },
      { id: "kubectl-get-endpoints", label: "kubectl get endpoints" },
      { id: "kubectl-get-networkpolicies", label: "kubectl get networkpolicies" },
    ],
    tasks: [
      {
        id: "check-service-endpoints",
        label: "Confirm service has healthy endpoints.",
        acceptedCommandIds: ["kubectl-get-endpoints", "kubectl-get-services"],
      },
      {
        id: "check-network-policy",
        label: "Check whether policies might block traffic.",
        acceptedCommandIds: ["kubectl-get-networkpolicies"],
      },
    ],
  },
  {
    id: "zero-downtime-rollout",
    title: "Scenario: Zero downtime deployments",
    description: "Users report errors during deploy windows.",
    context:
      "Validate rollout strategy and pod readiness before declaring deployment safe for production traffic.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-rollout-status", label: "kubectl rollout status deployment <name>" },
      { id: "kubectl-get-pods", label: "kubectl get pods" },
      { id: "kubectl-describe-deployment", label: "kubectl describe deployment <name>" },
    ],
    tasks: [
      {
        id: "observe-rollout",
        label: "Observe rollout status for availability impact.",
        acceptedCommandIds: ["kubectl-rollout-status"],
      },
      {
        id: "verify-readiness",
        label: "Verify readiness and unavailable counts.",
        acceptedCommandIds: ["kubectl-describe-deployment", "kubectl-get-pods"],
      },
    ],
  },
  {
    id: "persistent-storage-loss",
    title: "Scenario: Data lost on restart",
    description: "Database pod restart wiped application data.",
    context:
      "You need to check whether persistent volume claims are bound and used by the workload.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-get-pvc", label: "kubectl get pvc" },
      { id: "kubectl-get-pv", label: "kubectl get pv" },
      { id: "kubectl-describe-pvc", label: "kubectl describe pvc <name>" },
    ],
    tasks: [
      {
        id: "verify-pvc",
        label: "Verify PVC exists and is bound.",
        acceptedCommandIds: ["kubectl-get-pvc", "kubectl-describe-pvc"],
      },
      {
        id: "verify-pv",
        label: "Verify backing PV is provisioned.",
        acceptedCommandIds: ["kubectl-get-pv"],
      },
    ],
  },
  {
    id: "multi-env-separation",
    title: "Scenario: Multi-environment separation",
    description: "Dev, stage, and prod workloads overlap and cause confusion.",
    context:
      "Audit namespace boundaries to ensure environment workloads are isolated cleanly.",
    difficulty: "Beginner",
    commands: [
      { id: "kubectl-get-namespaces", label: "kubectl get namespaces" },
      { id: "kubectl-get-pods-dev", label: "kubectl get pods -n dev" },
      { id: "kubectl-get-pods-prod", label: "kubectl get pods -n prod" },
    ],
    tasks: [
      {
        id: "list-namespaces",
        label: "List namespaces used for environments.",
        acceptedCommandIds: ["kubectl-get-namespaces"],
      },
      {
        id: "compare-env-workloads",
        label: "Compare workloads in dev and prod namespaces.",
        acceptedCommandIds: ["kubectl-get-pods-dev", "kubectl-get-pods-prod"],
      },
    ],
  },
  {
    id: "works-local-fails-cluster",
    title: "Scenario: Works locally, fails in cluster",
    description: "App passes local tests but fails in Kubernetes.",
    context:
      "Collect environment and runtime evidence to isolate differences between local and cluster execution.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
      { id: "kubectl-logs-pod", label: "kubectl logs <pod>" },
      { id: "kubectl-exec-env", label: "kubectl exec -it <pod> -- env" },
    ],
    tasks: [
      {
        id: "inspect-runtime-errors",
        label: "Inspect runtime error output from cluster pod.",
        acceptedCommandIds: ["kubectl-logs-pod", "kubectl-describe-pod"],
      },
      {
        id: "inspect-env-vars",
        label: "Inspect environment variables inside the running pod.",
        acceptedCommandIds: ["kubectl-exec-env"],
      },
    ],
  },
  {
    id: "image-not-updating",
    title: "Scenario: Image not updating",
    description: "New code shipped, but pods still run old image.",
    context:
      "Validate deployed image tag and rollout behavior to avoid stale `latest` cache issues.",
    difficulty: "Production",
    commands: [
      { id: "kubectl-set-image", label: "kubectl set image deployment/app app=my-app:v2" },
      { id: "kubectl-rollout-status", label: "kubectl rollout status deployment app" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
    ],
    tasks: [
      {
        id: "update-versioned-image",
        label: "Update deployment with explicit versioned image.",
        acceptedCommandIds: ["kubectl-set-image"],
      },
      {
        id: "confirm-new-rollout",
        label: "Confirm rollout completed using new image.",
        acceptedCommandIds: ["kubectl-rollout-status", "kubectl-describe-pod"],
      },
    ],
  },
  {
    id: "cluster-security-restrictions",
    title: "Scenario: Security restrictions needed",
    description: "Platform team asks to tighten pod permissions.",
    context:
      "Audit role bindings and service accounts used by workloads before enforcing stricter policies.",
    difficulty: "Security/Cost",
    commands: [
      { id: "kubectl-get-rolebindings", label: "kubectl get rolebindings" },
      { id: "kubectl-get-serviceaccounts", label: "kubectl get serviceaccounts" },
      { id: "kubectl-auth-can-i", label: "kubectl auth can-i create pods --as=system:serviceaccount:default:app-sa" },
    ],
    tasks: [
      {
        id: "review-rbac-bindings",
        label: "Review RBAC bindings in namespace.",
        acceptedCommandIds: ["kubectl-get-rolebindings"],
      },
      {
        id: "validate-sa-permissions",
        label: "Validate permissions for service account.",
        acceptedCommandIds: ["kubectl-get-serviceaccounts", "kubectl-auth-can-i"],
      },
    ],
  },
  {
    id: "cost-optimization-audit",
    title: "Scenario: Cluster costs too high",
    description: "Finance reports over-provisioned Kubernetes spend.",
    context:
      "Collect resource usage evidence to right-size requests and identify idle capacity.",
    difficulty: "Security/Cost",
    commands: [
      { id: "kubectl-top-nodes", label: "kubectl top nodes" },
      { id: "kubectl-top-pods", label: "kubectl top pods -A" },
      { id: "kubectl-get-deployments", label: "kubectl get deployments -A" },
    ],
    tasks: [
      {
        id: "measure-actual-usage",
        label: "Measure actual node/pod utilization.",
        acceptedCommandIds: ["kubectl-top-nodes", "kubectl-top-pods"],
      },
      {
        id: "find-overprovisioned-workloads",
        label: "Identify workloads likely over-provisioned.",
        acceptedCommandIds: ["kubectl-get-deployments"],
      },
    ],
  },
  {
    id: "pro-debugging-workflow",
    title: "Scenario: Debugging like a pro",
    description: "You need a systematic command flow during incidents.",
    context:
      "Practice a high-signal debugging sequence from resource overview to shell-level inspection.",
    difficulty: "On-call",
    commands: [
      { id: "kubectl-get-all", label: "kubectl get all" },
      { id: "kubectl-describe-pod", label: "kubectl describe pod <pod>" },
      { id: "kubectl-logs-pod", label: "kubectl logs <pod>" },
      { id: "kubectl-exec-shell", label: "kubectl exec -it <pod> -- /bin/sh" },
    ],
    tasks: [
      {
        id: "start-with-overview",
        label: "Start with broad cluster overview.",
        acceptedCommandIds: ["kubectl-get-all"],
      },
      {
        id: "drill-into-pod",
        label: "Drill into pod details and logs.",
        acceptedCommandIds: ["kubectl-describe-pod", "kubectl-logs-pod"],
      },
      {
        id: "interactive-debug",
        label: "Open an interactive shell for deeper inspection.",
        acceptedCommandIds: ["kubectl-exec-shell"],
      },
    ],
  },
];

export const kubernetesJourneySteps: KubernetesJourneyStep[] = [
  { type: "lesson", lessonId: "intro" },
  { type: "scenario", scenarioId: "cluster-health-check" },
  { type: "lesson", lessonId: "kubectl-get" },
  { type: "scenario", scenarioId: "on-call-triage" },
  { type: "lesson", lessonId: "pod-yaml" },
  { type: "scenario", scenarioId: "pod-recovery" },
  { type: "lesson", lessonId: "deployment-yaml" },
  { type: "lesson", lessonId: "service-yaml" },
];

export function getNextKubernetesStep(
  current: KubernetesJourneyStep
): KubernetesJourneyStep | null {
  const index = kubernetesJourneySteps.findIndex((step) =>
    step.type === "lesson" && current.type === "lesson"
      ? step.lessonId === current.lessonId
      : step.type === "scenario" && current.type === "scenario"
        ? step.scenarioId === current.scenarioId
        : false
  );
  if (index < 0 || index >= kubernetesJourneySteps.length - 1) {
    return null;
  }
  return kubernetesJourneySteps[index + 1];
}

export function getKubernetesStepHref(step: KubernetesJourneyStep): string {
  return step.type === "lesson"
    ? `/learn/kubernetes/${step.lessonId}`
    : `/assessments/scenarios/${step.scenarioId}`;
}

export const scenarioDifficultyOrder: KubernetesScenario["difficulty"][] = [
  "Beginner",
  "On-call",
  "Production",
  "Security/Cost",
];

/** Single teaching path through real-world topics (Learn → Topics). Same difficulty tiers, stable order inside each. */
export function getKubernetesTopicsInTeachingOrder(): KubernetesScenario[] {
  const out: KubernetesScenario[] = [];
  for (const d of scenarioDifficultyOrder) {
    for (const s of kubernetesScenarios) {
      if (s.difficulty === d) out.push(s);
    }
  }
  return out;
}

export function topicProgressId(scenarioId: string): string {
  return `topic:${scenarioId}`;
}

export function getTeachingTopicUnlockState(
  scenarioId: string,
  completedIds: ReadonlySet<string>
): {
  unlocked: boolean;
  previousTopicTitle: string | null;
  previousTopicId: string | null;
} {
  const order = getKubernetesTopicsInTeachingOrder();
  const idx = order.findIndex((s) => s.id === scenarioId);
  if (idx < 0) return { unlocked: false, previousTopicTitle: null, previousTopicId: null };
  if (idx === 0) return { unlocked: true, previousTopicTitle: null, previousTopicId: null };
  const prev = order[idx - 1];
  const unlocked = completedIds.has(topicProgressId(prev.id));
  return {
    unlocked,
    previousTopicTitle: prev.title.replace(/^Scenario:\s*/i, "").trim() || prev.title,
    previousTopicId: prev.id,
  };
}

export function getNextTeachingTopicHref(currentScenarioId: string): string | null {
  const order = getKubernetesTopicsInTeachingOrder();
  const idx = order.findIndex((s) => s.id === currentScenarioId);
  if (idx < 0 || idx >= order.length - 1) return null;
  return `/learn/kubernetes/topics/${order[idx + 1].id}`;
}

