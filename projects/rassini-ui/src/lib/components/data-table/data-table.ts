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
import { TableModule, Table, TablePageEvent } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

export interface DataTableColumn {
  field: string;
  header: string;
  type?: 'text' | 'actions';
  sortable?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule
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

  @ContentChild('actions')
  actionsTemplate?: TemplateRef<any>;

  @ViewChild('dt')
  table!: Table;

  @Output()
  rowsSelected = new EventEmitter<any[]>();

  selection: any[] = [];

  onSelectionChanged(): void {

      this.rowsSelected.emit(
          this.selection
      );

  }

  onPage(event: TablePageEvent): void {

      this.pageChange.emit(event);

}

}