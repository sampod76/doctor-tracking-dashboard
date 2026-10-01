/**
 * Generic permission structure used for authorization checks.
 * The previous application used a more detailed module/permission model
 * tied to specific business modules (b2b, b2c, admin, etc). Future
 * projects should extend these types as the new domain requires.
 */
export interface UserPermissions {
  allPermission: {
    id: string;
    module_permission: ModulePermission;
  }[];
  allModules: {
    id: string;
    label: string;
    value: string;
  }[];
}

export interface ModulePermission {
  id: string;
  label: string;
  value: string;
  module: Module;
}

export interface Module {
  id: string;
  label: string;
  value: string;
}
