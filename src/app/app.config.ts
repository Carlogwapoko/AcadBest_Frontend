import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules,provideRouter,withInMemoryScrolling,withPreloading } from '@angular/router';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/api.interceptor';
import { routes } from './app.routes';
export const appConfig:ApplicationConfig={providers:[
  provideRouter(routes,withInMemoryScrolling({scrollPositionRestoration:'top'}),withPreloading(PreloadAllModules)),
  provideHttpClient(withInterceptors([apiInterceptor]))
]};
