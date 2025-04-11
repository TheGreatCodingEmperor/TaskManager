import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WeatherForecastService } from './app/api/services';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    constructor(
        private weatherForecastService:WeatherForecastService
    ){
        this.weatherForecastService.apiWeatherForecastGet$Json()
        .subscribe(res => {
            console.log(res);
        })
    }
}
