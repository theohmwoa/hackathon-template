import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preview-panel.component.html',
  styleUrls: ['./preview-panel.component.scss']
})
export class PreviewPanelComponent implements OnInit {
  previewUrl: SafeResourceUrl;
  loading = true;
  error = false;

  constructor(private sanitizer: DomSanitizer) {
    // Set default preview URL
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://google.com');
  }

  ngOnInit(): void {
    // Can add logic to change preview URL based on project/message context
  }

  /**
   * Handle iframe load event
   */
  onIframeLoad(): void {
    this.loading = false;
    this.error = false;
  }

  /**
   * Handle iframe error event
   */
  onIframeError(): void {
    this.loading = false;
    this.error = true;
  }

  /**
   * Update the preview URL
   * Can be called from parent component to change the preview
   */
  updatePreviewUrl(url: string): void {
    this.loading = true;
    this.error = false;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
