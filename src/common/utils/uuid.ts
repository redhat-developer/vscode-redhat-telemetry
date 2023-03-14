import { v4, v5 } from 'uuid';

const REDHAT_NAMESPACE_UUID = '44662bc6-c388-4e0e-a652-53bda6f35923';

export function generateUUID(source?: string): string {
  if (source) {
    return v5(source, REDHAT_NAMESPACE_UUID);
  }
  return v4();
}