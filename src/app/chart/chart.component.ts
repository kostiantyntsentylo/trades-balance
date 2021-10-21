import { Component, OnInit } from '@angular/core';
import { Color } from 'ng2-charts';
import { TradeStateService } from '../trade-state.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.css']
})


export class ChartComponent implements OnInit {
  public lineChartOptions: any = {
    responsive: true,
  };
  public lineChartColors: Color[] = [
    {
      borderColor: 'black',
      backgroundColor: 'rgb(255, 215, 64)',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];
  public balanceByDate$ = this.tradeStateService.balanceByDate$;

  constructor(private tradeStateService: TradeStateService) {}
  ngOnInit(): void {
    this.balanceByDate$ = this.tradeStateService.balanceByDate$;
  }

}
