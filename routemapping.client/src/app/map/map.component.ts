import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, polyline, Map, LeafletMouseEvent, marker } from 'leaflet';
import { RouteService, Route, RoutePoint } from '../route.service';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  options: any;
  map: Map | undefined;
  isCreatingRoute = false;
  routePoints: RoutePoint[] = [];
  currentPolyline: any;

  constructor(private routeService: RouteService, private http: HttpClient) { }

  ngOnInit(): void {
    this.options = {
      layers: [
        tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
      ],
      zoom: 13,
      center: latLng(41.437, 22.641) // Centered on Strumica
    };
    this.loadRoadData();
  }

  onMapReady(map: Map): void {
    this.map = map;
    (L as any).Routing.control({
      waypoints: [],
      routeWhileDragging: true
    }).addTo(this.map);
  }

  loadRoadData(): void {
    const overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];way["highway"](around:50000,41.437,22.641);out;>;out skel qt;';
    this.http.get(overpassUrl).subscribe((data: any) => {
      this.addRoadDataToMap(data);
    });
  }

  addRoadDataToMap(data: any): void {
    const roads = data.elements.filter((element: any) => element.type === 'way');
    roads.forEach((road: any) => {
      const points = road.nodes.map((node: any) => latLng(node.lat, node.lon));
      const isOneWay = road.tags.oneway === 'yes';
      L.polyline(points, { color: isOneWay ? 'red' : 'blue' }).addTo(this.map!);
    });
  }

  loadRoutes(): void {
    this.routeService.getRoutes().subscribe((routes: Route[]) => {
      routes.forEach(route => {
        const points = route.routePoints.map((point: RoutePoint) => latLng(point.latitude, point.longitude));
        polyline(points).addTo(this.map!);
      });
    });
  }

  startRoute(): void {
    this.isCreatingRoute = true;
    this.routePoints = [];
    if (this.currentPolyline) {
      this.map?.removeLayer(this.currentPolyline);
    }
  }

  onMapClick(event: LeafletMouseEvent): void {
    if (this.isCreatingRoute) {
      const point: RoutePoint = {
        routePointId: 0,
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
        order: this.routePoints.length + 1,
        routeId: 0,
      };
      this.routePoints.push(point);
      marker([point.latitude, point.longitude]).addTo(this.map!);

      if (this.currentPolyline) {
        this.map?.removeLayer(this.currentPolyline);
      }

      const points = this.routePoints.map(p => latLng(p.latitude, p.longitude));
      this.currentPolyline = polyline(points).addTo(this.map!);
    }
  }

  saveRoute(): void {
    const route: Route = {
      routeId: 0,
      name: `Route ${new Date().toLocaleString()}`,
      routePoints: this.routePoints
    };
    this.routeService.createRoute(route).subscribe(() => {
      this.isCreatingRoute = false;
      this.loadRoutes();
    });
  }
}
