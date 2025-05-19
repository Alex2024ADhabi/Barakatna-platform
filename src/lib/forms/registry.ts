import { FormMetadata, FormRegistryEntry } from "./types";

class FormRegistry {
  private forms: Map<string, FormMetadata> = new Map();
  private registry: Map<string, FormRegistryEntry> = new Map();

  registerForm(entry: FormRegistryEntry, metadata: FormMetadata): void {
    if (this.registry.has(entry.id)) {
      console.warn(
        `Form with ID ${entry.id} already exists in registry. Overwriting.`,
      );
    }

    this.registry.set(entry.id, entry);
    this.forms.set(entry.id, metadata);
  }

  getFormMetadata(id: string): FormMetadata | undefined {
    return this.forms.get(id);
  }

  getFormEntry(id: string): FormRegistryEntry | undefined {
    return this.registry.get(id);
  }

  getAllForms(): FormRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  getFormsByModule(module: string): FormRegistryEntry[] {
    return Array.from(this.registry.values()).filter(
      (entry) => entry.module === module,
    );
  }

  getFormsByClientType(clientType: string): FormRegistryEntry[] {
    return Array.from(this.registry.values()).filter((entry) =>
      entry.clientTypes.includes(clientType as any),
    );
  }
}

export const formRegistry = new FormRegistry();

// Import all form metadata files here to register them
import "./metadata/beneficiary-forms";
import "./metadata/beneficiary-qualification-form";
import "./metadata/assessment-eligibility-form";
import "./metadata/client-forms";
import "./metadata/client-service-agreement-form";
import "./metadata/client-feedback-form";
import "./metadata/committee-forms";
import "./metadata/committee-decision-form";
import "./metadata/inventory-reconciliation-form";
import "./metadata/case-closure-form";
import "./metadata/drawing-forms";
import "./metadata/manpower-forms";
import "./metadata/cohort-forms";
import "./metadata/price-list-forms";
import "./metadata/supplier-forms";
import "./metadata/budget-forms";
import "./metadata/financial-forms";
import "./metadata/inventory-forms";
import "./metadata/case-forms";
import "./metadata/admin-forms";
