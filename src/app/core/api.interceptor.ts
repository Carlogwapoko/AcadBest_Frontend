import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, timeout } from 'rxjs';
import { throwError } from 'rxjs';

export const apiInterceptor:HttpInterceptorFn=(request,next)=>{
  const token=localStorage.getItem('acadbest.api_token');
  const authenticated=token?request.clone({setHeaders:{Authorization:`Bearer ${token}`}}):request;
  return next(authenticated).pipe(
    timeout({first:8000}),
    catchError(error=>{
      if(error?.name==='TimeoutError'){
        return throwError(()=>new HttpErrorResponse({status:408,statusText:'Request timed out',
          error:{message:'The server is taking too long to respond. Please try again.'}}));
      }
      if(error instanceof HttpErrorResponse&&error.status===0){
        return throwError(()=>new HttpErrorResponse({status:0,statusText:'Service unavailable',
          error:{message:'AcadBest could not reach the server. Check the backend and database connection, then try again.'}}));
      }
      return throwError(()=>error);
    })
  );
};
