import { MenuItem } from 'primeng/api';

export interface AppMenuItem extends MenuItem {
  badge?: string;
  shortcut?: string;
}
