import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features = [
    {
      icon: '🪄',
      title: 'AI-Powered Building',
      description: 'Build websites by describing what you want in plain English'
    },
    {
      icon: '👁️',
      title: 'Live Preview',
      description: 'See your changes in real-time with instant preview'
    },
    {
      icon: '🚀',
      title: 'One-Click Deploy',
      description: 'Deploy to production with a single click'
    }
  ];
}
