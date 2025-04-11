import { Component, EventEmitter, input, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { UtilityShareModule } from '../../utility-share/utility-share.module';

@Component({
  imports:[UtilityShareModule],
  selector: 'app-custom-paginator',
  template: `
    <p-paginator
      [rows]="pageSize"
      [totalRecords]="totalCount"
      [first]="(page - 1) * pageSize"
      (onPageChange)="onPageChange($event)">
    </p-paginator>
  `
})
export class CustomPaginatorComponent implements OnChanges {
  @Input() totalCount = 0;
  @Input() pageSize = 10;
  @Input() page = 1;
  @Input() queryParameters = new queryParameters;
  @Output() pageChange = new EventEmitter<number>();

  ngOnChanges(changes: SimpleChanges): void {
    this.pageSize = this.queryParameters.PageSize;
    this.page = this.queryParameters.Page;
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageChange.emit(this.page);
  }
}

export class queryParameters {
  OrderColumn: string = '';
  OrderDescending: boolean = false;
  Page = 1;
  PageSize = 10;
}