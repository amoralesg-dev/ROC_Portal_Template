import { MenuItem } from './menu-item.model';

export interface NavigationGroup {
    label: string;
    items: MenuItem[];
}