/**
 * Registry for form metadata and other configuration
 */

interface FormMetadata {
  id: string;
  name: string;
  description?: string;
  clientTypeId: number;
  sections?: any[];
  workflowSteps?: any[];
  eligibilityCriteria?: any[];
  integrations?: any[];
  [key: string]: any;
}

const formMetadataRegistry = new Map<string, FormMetadata>();

/**
 * Register form metadata in the registry
 * @param metadata Form metadata to register
 */
export function registerFormMetadata(metadata: FormMetadata): void {
  formMetadataRegistry.set(metadata.id, metadata);
}

/**
 * Get form metadata by ID
 * @param id Form metadata ID
 * @returns Form metadata or undefined if not found
 */
export function getFormMetadata(id: string): FormMetadata | undefined {
  return formMetadataRegistry.get(id);
}

/**
 * Get all form metadata for a specific client type
 * @param clientTypeId Client type ID
 * @returns Array of form metadata for the client type
 */
export function getFormMetadataByClientType(
  clientTypeId: number,
): FormMetadata[] {
  return Array.from(formMetadataRegistry.values()).filter(
    (metadata) => metadata.clientTypeId === clientTypeId,
  );
}

/**
 * Get all registered form metadata
 * @returns Array of all form metadata
 */
export function getAllFormMetadata(): FormMetadata[] {
  return Array.from(formMetadataRegistry.values());
}
