import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Route } from './models/route';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'http://localhost:5000/api/route';

  constructor(private http: HttpClient) { }

  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  getRoute(id: number): Observable<Route> {
    return this.http.get<Route>(`${this.apiUrl}/${id}`);
  }

  saveRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, route);
  }

  updateRoute(id: number, route: Route): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, route);
  }

  deleteRoute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
