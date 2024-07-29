import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:5000/api/routes';

  constructor(private http: HttpClient) { }

  getRoutes(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  saveRoute(route: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, route);
  }
}
