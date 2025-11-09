import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  healthStatus: any = null;
  currentUser: any = null;

  constructor(
    private apiService: ApiService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit() {
    this.checkHealth();
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  checkHealth() {
    this.apiService.get<any>('health').subscribe({
      next: (data) => {
        this.healthStatus = data;
      },
      error: (error) => {
        console.error('Failed to check health:', error);
      }
    });
  }
}
