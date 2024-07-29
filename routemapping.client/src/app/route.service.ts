import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Route {
  routeId: number;
  name: string;
  routePoints: RoutePoint[];
}

export interface RoutePoint {
  routePointId: number;
  latitude: number;
  longitude: number;
  order: number;
  routeId: number;
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiUrl = 'https://localhost:5001/api/routes';

  constructor(private http: HttpClient) { }

  getRoutes(): Observable<Route[]> {
    return this.http.get<Route[]>(this.apiUrl);
  }

  createRoute(route: Route): Observable<Route> {
    return this.http.post<Route>(this.apiUrl, route);
  }
}
