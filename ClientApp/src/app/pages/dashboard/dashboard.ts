import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { CustomPaginatorComponent, queryParameters } from '../../shared/components/custom-paginator/custom-paginator.component';
import * as _ from 'lodash';
import { UtilityShareModule } from '../../shared/utility-share/utility-share.module';
import { BiService } from '../../bi/bi.service';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget, UtilityShareModule, CustomPaginatorComponent],
    template: `
        <p-table [value]="rowKeys">
            <ng-template pTemplate="header">
                <tr>
                    <th></th>
                    <ng-container *ngFor="let colKey of colKeys">
                        <th *ngFor="let val of valueNames">{{colKey}} {{val.name}}</th>
                    </ng-container>
                </tr>
            </ng-template>
            <ng-template pTemplate="body" let-rowKey>
                <tr>
                    <th>{{rowKey}}</th>
                    <ng-container *ngFor="let colKey of colKeys">
                        <td *ngFor="let val of valueNames">{{data[rowKey][colKey]?.[val.name]??''}}</td>
                    </ng-container>
                </tr>
            </ng-template>
        </p-table>
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
                <app-best-selling-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-revenue-stream-widget />
                <app-notifications-widget />
            </div>
        </div>
    `
})

// <app-custom-paginator [totalCount]="totalCount" [queryParameters]="queryParameters" (pageChange)="search($event)"></app-custom-paginator>
// <pre>{{result|json}}</pre>
export class Dashboard implements OnInit {
    conditions: any = {
        Date: null,
        TemperatureC: null,
        TemperatureF: null,
        Summary: null
    };
    queryParameters: queryParameters = new queryParameters;
    result: any[] = [];
    totalCount: number = 0;
    colNames: string[] = ["region","country"];
    rowNames: string[] = ["brand","model"];
    valueNames: { name: string, fn: string }[] = [
        { name: "quantity", fn: "sum" },
        { name: "unitPrice", fn: "first" },
    ];

    data: any = {};
    rowKeys: string[] = [];
    colKeys: string[] = [];
    constructor(
        private biService: BiService
    ) {
        this.queryParameters.PageSize = 3;
        this.conditions.TemperatureC = 10;

        const { result, rowKeys, colKeys } = this.biService.test(
            this.colNames,
            this.rowNames,
            this.valueNames);
        console.log(result);
        this.data = result;
        this.rowKeys = rowKeys;
        this.colKeys = colKeys;
    }

    ngOnInit(): void {
        this.search();
    }

    search(page: number | any = 1) {
        this.queryParameters.Page = page ?? 1;
        let request = _.cloneDeep(this.queryParameters);
        request = Object.assign(request, this.conditions);
    }
}
