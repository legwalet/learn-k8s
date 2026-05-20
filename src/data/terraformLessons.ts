import type { Lesson } from "@/data/lessons";

export const terraformLessons: Lesson[] = [
  {
    id: "intro",
    title: "What is Terraform?",
    description: "Infrastructure as code in plain language.",
    code: `# Terraform describes infrastructure in .tf files.
# Providers talk to APIs (AWS, Azure, Kubernetes, …).
# terraform init  → download providers
# terraform plan  → preview changes
# terraform apply → create/update resources
`,
    language: "hcl",
    instructions: `**Terraform** lets you declare what infrastructure should exist (servers, networks, Kubernetes namespaces) and applies changes in a repeatable way.

Key ideas: **providers**, **resources**, **state**, and the **plan → apply** workflow. Try \`terraform plan\` in the simulated terminal below.`,
    hint: "Try: terraform plan",
  },
  {
    id: "first-resource",
    title: "Your first resource",
    description: "Declare a resource block in HCL.",
    code: `terraform {
  required_version = ">= 1.0"
}

resource "null_resource" "hello" {
  provisioner "local-exec" {
    command = "echo Hello from Terraform"
  }
}
`,
    language: "hcl",
    instructions: `A **resource** block tells Terraform to manage something. The \`null_resource\` is a safe teaching example with no cloud account required.

Keep a \`resource\` block in your file, then run \`terraform validate\` in the terminal.`,
    hint: "Try: terraform validate",
  },
  {
    id: "variables",
    title: "Variables & outputs",
    description: "Parameterize configs and expose values.",
    code: `variable "environment" {
  type    = string
  default = "dev"
}

resource "null_resource" "app" {
  triggers = {
    env = var.environment
  }
}

output "environment" {
  value = var.environment
}
`,
    language: "hcl",
    instructions: `Use **variables** for values that change per environment. Use **outputs** to surface IDs or hostnames after apply.

Your file should include both a \`variable\` block and an \`output\` block. Run \`terraform fmt\` to format the file.`,
    hint: "Try: terraform fmt",
  },
  {
    id: "plan-apply",
    title: "Plan vs apply",
    description: "Preview changes, then apply safely.",
    code: `# After editing .tf files:
# terraform init    (once per workspace)
# terraform plan    (read-only preview)
# terraform apply   (make changes — use -auto-approve only in automation)

resource "null_resource" "deploy" {}
`,
    language: "hcl",
    instructions: `On real projects, always **plan** before **apply**. Plan shows what would be created, changed, or destroyed.

Run \`terraform plan\` then \`terraform apply\` in the simulator (apply is simulated here).`,
    hint: "Try: terraform plan",
  },
];

function cleanTerraformInput(cmd: string): string {
  let trimmed = cmd.trim();
  if (trimmed.startsWith("$")) trimmed = trimmed.slice(1).trim();
  return trimmed.toLowerCase().replace(/\s+/g, " ");
}

export function getSimulatedTerraformOutput(cmd: string): string {
  const c = cleanTerraformInput(cmd);

  if (c === "clear") return "__CLEAR__";

  if (c === "terraform" || c === "terraform -help" || c === "terraform --help") {
    return `Usage: terraform [global options] <subcommand> ...

Common commands:
  init      Prepare a working directory
  plan      Generate an execution plan
  apply     Apply changes
  validate  Check configuration syntax`;
  }

  if (c === "terraform init") {
    return `Initializing the backend...

Initializing provider plugins...
- Finding latest version of hashicorp/null...
- Installing hashicorp/null v3.2.2...

Terraform has been successfully initialized!`;
  }

  if (c === "terraform validate") {
    return `Success! The configuration is valid.`;
  }

  if (c === "terraform fmt") {
    return `main.tf`;
  }

  if (c === "terraform plan") {
    return `Terraform used the selected providers to generate the following execution plan.

Terraform will perform the following actions:

  # null_resource.deploy will be created
  + resource "null_resource" "deploy" {
      + id = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.`;
  }

  if (c === "terraform apply" || c === "terraform apply -auto-approve") {
    return `null_resource.deploy: Creating...
null_resource.deploy: Creation complete after 0s [id=481729932037621225]

Apply complete! Resources: 1 added, 0 changed, 0 destroyed.`;
  }

  if (c === "terraform show") {
    return `# null_resource.deploy:
resource "null_resource" "deploy" {
    id = "481729932037621225"
}`;
  }

  if (c.startsWith("terraform workspace")) {
    return `default`;
  }

  return `Command not recognized in this simulator. Try:
terraform init | terraform validate | terraform fmt | terraform plan | terraform apply`;
}
