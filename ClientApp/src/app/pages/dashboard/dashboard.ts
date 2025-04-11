import { Component, OnInit } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { WeatherForecast } from '../../api/models/weather-forecast';
import { WeatherForecastService } from '../../api/services';
import { CustomPaginatorComponent, queryParameters } from '../../shared/components/custom-paginator/custom-paginator.component';
import * as _ from 'lodash';
import { UtilityShareModule } from '../../shared/utility-share/utility-share.module';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget, UtilityShareModule, CustomPaginatorComponent],
    template: `
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
        <pre>{{result|json}}</pre>
        <app-custom-paginator [totalCount]="totalCount" [queryParameters]="queryParameters" (pageChange)="search($event)"></app-custom-paginator>
    `
})
export class Dashboard implements OnInit {
    conditions:any = {
        Date: null,
        TemperatureC: null,
        TemperatureF: null,
        Summary: null
    };
    queryParameters: queryParameters = new queryParameters;
    result: any[] = [];
    totalCount: number = 0;
    constructor(
        private weatherForecastService: WeatherForecastService
    ) {
        this.queryParameters.PageSize = 3;
        this.conditions.TemperatureC = 10;
    }

    ngOnInit(): void {
        this.search();
    }

    search(page: number | any = 1) {
        this.queryParameters.Page = page ?? 1;
        let request = _.cloneDeep(this.queryParameters);
        request = Object.assign(request,this.conditions);
        this.weatherForecastService.apiWeatherForecastGet$Json(request)
            .subscribe(res => {
                this.result = res.items;
                this.totalCount = res.totalCount;
            })
    }
}
