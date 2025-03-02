import { bootstrapApplication } from '@angular/platform-browser';
import { UploadComponent } from './app/components/upload/upload.component';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(UploadComponent, {
  providers: [provideHttpClient()]
}).catch(err => console.error(err));
