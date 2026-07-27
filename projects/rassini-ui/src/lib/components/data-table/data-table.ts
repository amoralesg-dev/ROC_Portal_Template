import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TruncatePipe } from '../../pipes/truncate.pipe';
import { TooltipModule } from 'primeng/tooltip';
import {
  TableModule,
  Table,
  TablePageEvent,
  TableLazyLoadEvent,
} from 'primeng/table';

export interface DataTableColumn {
  field: string;
  header: string;
  type?: 'text' | 'actions';
  sortable?: boolean;
  editable?: boolean;
  maxlength?: number;
  placeholder?: string;
  width?: string;
  styleClass?: string;
  truncateLength?: number;
  tooltip?: boolean;
}


@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    TruncatePipe,
    TooltipModule
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss'
})
export class DataTable {

  @Input()
  columns: DataTableColumn[] = [];

  @Input()
  data: any[] = [];

  @Input()
  paginator = true;

  @Input()
  rows = 10;

  @Input()
  rowsPerPageOptions = [5, 10, 20, 50];

  @Input()
  globalFilterFields: string[] = [];

  @Input()
  loading = false;

  @Input()
  totalRecords = 0;

  @Input()
  lazy = false;

  @Output()
  pageChange = new EventEmitter<TablePageEvent>();

  @Output()
  lazyLoadChange = new EventEmitter<TableLazyLoadEvent>();

  @ContentChild('actions')
  actionsTemplate?: TemplateRef<any>;

  @ViewChild('dt')
  table!: Table;

  @Output()
  rowsSelected = new EventEmitter<any[]>();

  @Input()
  remoteFilter = false;

  @Output()
  globalFilterChange =
      new EventEmitter<string>();

  @Input()
  searchPlaceholder = 'Buscar...';

  @Input()
  emptyTitle = 'No se encontraron registros';

  @Input()
  emptySubtitle =
      'Ajusta los filtros o intenta una nueva búsqueda';


  selection: any[] = [];

  onSelectionChanged(): void {

      this.rowsSelected.emit(
          this.selection
      );

  }

  onPage(event: TablePageEvent): void {

        this.pageChange.emit(event);

  }
  onGlobalFilter(event: Event): void {

      const value =
          (event.target as HTMLInputElement).value;

      if (this.remoteFilter) {

          this.globalFilterChange.emit(value);

          return;
      }

      this.table.filterGlobal(
          value,
          'contains'
      );

  }
  onLazyLoad(event: TableLazyLoadEvent): void {

      this.lazyLoadChange.emit(event);

  }


}