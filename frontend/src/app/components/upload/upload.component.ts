import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io } from 'socket.io-client';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  selectedFile: File | null = null;
  statusMessage: string = '';
  gifUrl: string = '';
  socket = io('http://localhost:3000');

  constructor(private http: HttpClient) {
    this.socket.on('job-added', (data: any) => {
      this.statusMessage = `Processing: ${data.filename}`;
    });

    this.socket.on('job-completed', (data: any) => {
      this.statusMessage = 'You can download the GIF by clicking the button below!';
      this.gifUrl = `http://localhost:3000${data.outputPath}`;
    });

    this.socket.on("job-failed", (data) => {
      this.statusMessage = data.error;
    });
    
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.statusMessage = '';
      this.gifUrl = '';
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      alert('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('video', this.selectedFile);

    this.http.post('http://localhost:3000/upload', formData).subscribe({
      next: (res: any) => {
        this.statusMessage = res.message;
      },
      error: (err) => {
        console.error('Upload error:', err);
        this.statusMessage = 'Upload failed. ' + err.error?.error;
      }
    });
  }

  downloadGif() {
    if (!this.gifUrl) return;
  
    fetch(this.gifUrl)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'converted.gif';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      })
      .catch(error => console.error('Download failed:', error));
  }
}