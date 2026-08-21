import { Component, OnInit } from '@angular/core';
import { ApiService, HealthResponse } from './core/services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  backendStatus = 'Checking...';
  backendMessage = 'Connecting to SentinelHeat AI backend...';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.checkHealth().subscribe({
      next: (response: HealthResponse) => {
        console.log('BACKEND CONNECTED');
        console.log(response);

        this.backendStatus = response.status;
        this.backendMessage = response.message;
      },

      error: (error: any) => {
        console.error('BACKEND CONNECTION FAILED');
        console.error(error);

        this.backendStatus = 'Error';
        this.backendMessage = 'Could not connect to backend.';
      }
    });
  }
}