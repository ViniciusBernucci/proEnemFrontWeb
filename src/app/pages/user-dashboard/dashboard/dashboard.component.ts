/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, Renderer2, ViewChild } from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { routes } from '../../../shared/routes/routes';
import { DateRangePickerComponent } from '../../../features/common/date-range-picker/date-range-picker.component';
import { CollapseHeaderComponent } from '../../../features/common/collapse-header/collapse-header.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { AuthService } from '../../../core/services/auth.service';


export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
}
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    imports: [NgApexchartsModule,DateRangePickerComponent,RouterLink,CollapseHeaderComponent,CommonModule]
})
export class DashboardComponent implements OnInit{
  public routes=routes;
  @ViewChild('chart') chart!: ChartComponent;
  public revenue_income: Partial<ChartOptions> | any;
  public companyChart: Partial<ChartOptions> | any;
  public planOverview: Partial<ChartOptions> | any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  
  public stats?: DashboardStats;
  public isLoadingStats = true;

  constructor(
      private renderer: Renderer2, 
      private dashboardService: DashboardService,
      public authService: AuthService
  ) {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];

  }
  ngOnInit(): void {
    this.renderer.addClass(document.body, 'date-picker');
    this.carregarMetadados();
    this.initCharts();
  }

  initCharts(): void {
    this.revenue_income = {
    chart: {
      height: 260,
      type: 'bar',
      stacked: true,
      toolbar: {
        show: false,
      }
    },
    colors: ['#0E9384', '#E8E8E8'], // Progress then background
    plotOptions: {
      bar: {
        borderRadius: 5,
        borderRadiusWhenStacked: 'all',
        horizontal: false,
        endingShape: 'rounded',
        columnWidth: '24px',
      },
    },
    series: [
      {
        name: 'Tarefas Concluídas',
        data: this.stats?.monthly_chart || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      {
        name: 'Meta (bg)',
        data: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
      }
    ],
    xaxis: {
      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out','Nov', 'Dez'],
      labels: {
        style: {
          colors: '#0E9384',
          fontSize: '13px',
        }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      labels: {
        offsetX: -15,
        style: {
          colors: '#6B7280',
          fontSize: '13px',
        },
        formatter: function (value:any) {
          return value;
        }
      }
    },
    grid: {
      borderColor: 'transparent',
      strokeDashArray: 5,
      padding: {
        left: -8,
      },
    },
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: function (val:any) {
          return val + " tarefas";
        }
      }
    },
    fill: {
      opacity: 1
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }]
  }
    this.companyChart = {
    chart: {
      height: 320,
      type: 'bar',
      toolbar: {
        show: false,
      },
      background: '#fff' // Background of the full chart area
    },
    colors: ['#E04F16'], // Progress bar color
    plotOptions: {
      bar: {
        borderRadius: 5,
        horizontal: false,
        columnWidth: '10px', // Progress bar width
        endingShape: 'rounded',
        colors: {
          backgroundBarColors: ['#E8E8E8'], // Background of each bar
          backgroundBarOpacity: 1,
        }
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: false
    },
    series: [{
      name: 'Tarefas Concluídas',
      data: this.stats?.weekly_chart || [0, 0, 0, 0, 0, 0, 0]
    }],
    xaxis: {
      categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      labels: {
        style: {
          colors: '#E04F16',
          fontSize: '13px',
        }
      }
    },
    yaxis: {
      labels: {
        offsetX: -15,
        show: false
      }
    },
    grid: {
      borderColor: '#E5E7EB',
      strokeDashArray: 5,
      padding: {
        left: -8,
      },
    },
    legend: {
      show: false
    },
    fill: {
      opacity: 1
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }]
  }
    this.planOverview = {
    chart: {
      height: 240,
      type: 'donut',
      toolbar: {
        show: false,
      }
    },
    colors: ['#E41F07', '#FFA201', '#2F80ED'],
    series: this.stats?.subject_chart?.series?.length ? this.stats.subject_chart.series : [1, 1, 1],
    labels: this.stats?.subject_chart?.labels?.length ? this.stats.subject_chart.labels : ['Matemática', 'Português', 'História'],
    plotOptions: {
      pie: {
        donut: {
          size: '50%',
          labels: {
            show: false
          },
          borderRadius: 30
        }
      }
    },
    stroke: {
      lineCap: 'round',
      show: true,
      width: 0,    // Space between donut sections
      colors: '#fff'
    },
    dataLabels: {
      enabled: false
    },
    legend: { show: false },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 180,
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }
  }

  getProgressPercent(): number {
    if (!this.stats || !this.stats.meta_semana || this.stats.meta_semana === 0) return 0;
    const pct = Math.round((this.stats.estudados_semana / this.stats.meta_semana) * 100);
    return Math.min(pct, 100);
  }

  carregarMetadados() {
    this.isLoadingStats = true;
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoadingStats = false;
        // Reinicializa as configs dos gráficos com os dados reais injetados
        this.initCharts();
      },
      error: (err) => {
        console.error('Erro ao buscar stats do dashboard', err);
        this.isLoadingStats = false;
      }
    });
  }

ngOnDestroy():void{
  this.renderer.removeClass(document.body,'date-picker')
}
}
