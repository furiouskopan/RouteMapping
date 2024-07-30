import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, polyline, Map, LeafletMouseEvent, marker, Marker } from 'leaflet';
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
  markers: Marker[] = [];
  routeDistance: number = 0;
  routeDuration: number = 0;

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
    this.clearMarkers();
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
      const newMarker: Marker = marker([point.latitude, point.longitude], { draggable: true })
        .on('dragend', (e) => this.updateRoutePoints(e))
        .on('contextmenu', () => this.removePoint(newMarker))
        .addTo(this.map!);
      this.markers.push(newMarker);

      if (this.currentPolyline) {
        this.map?.removeLayer(this.currentPolyline);
      }

      const points = this.routePoints.map(p => latLng(p.latitude, p.longitude));
      this.currentPolyline = polyline(points).addTo(this.map!);
      this.calculateRouteDetails();
    } else {
      // Highlight the road to the clicked location
      this.highlightRoad(event.latlng);
    }
  }

  updateRoutePoints(event: any): void {
    const movedMarker = event.target;
    const newLatLng = movedMarker.getLatLng();
    const index = this.markers.indexOf(movedMarker);
    if (index !== -1) {
      this.routePoints[index].latitude = newLatLng.lat;
      this.routePoints[index].longitude = newLatLng.lng;
    }

    if (this.currentPolyline) {
      this.map?.removeLayer(this.currentPolyline);
    }

    const points = this.routePoints.map(p => latLng(p.latitude, p.longitude));
    this.currentPolyline = polyline(points).addTo(this.map!);
    this.calculateRouteDetails();
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

  clearMarkers(): void {
    this.markers.forEach(marker => this.map?.removeLayer(marker));
    this.markers = [];
  }

  removePoint(marker: Marker): void {
    const index = this.markers.indexOf(marker);
    if (index !== -1) {
      this.routePoints.splice(index, 1);
      this.map?.removeLayer(marker);
      this.markers.splice(index, 1);

      if (this.currentPolyline) {
        this.map?.removeLayer(this.currentPolyline);
      }

      const points = this.routePoints.map(p => latLng(p.latitude, p.longitude));
      this.currentPolyline = polyline(points).addTo(this.map!);
      this.calculateRouteDetails();
    }
  }

  clearAllRoutes(): void {
    this.routePoints = [];
    if (this.currentPolyline) {
      this.map?.removeLayer(this.currentPolyline);
    }
    this.clearMarkers();
  }

  calculateRouteDetails(): void {
    if (this.routePoints.length > 1) {
      let distance = 0;
      for (let i = 0; i < this.routePoints.length - 1; i++) {
        const point1 = this.routePoints[i];
        const point2 = this.routePoints[i + 1];
        distance += this.getDistance(latLng(point1.latitude, point1.longitude), latLng(point2.latitude, point2.longitude));
      }
      this.routeDistance = distance;
      this.routeDuration = (distance / 50) * 60; // Assuming an average speed of 50 km/h
    } else {
      this.routeDistance = 0;
      this.routeDuration = 0;
    }
  }

  getDistance(point1: L.LatLng, point2: L.LatLng): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    const lat1 = this.toRad(point1.lat);
    const lat2 = this.toRad(point2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }

  toRad(value: number): number {
    return value * Math.PI / 180;
  }

  highlightRoad(destination: L.LatLng): void {
    if (this.map) {
      (L as any).Routing.control({
        waypoints: [latLng(41.437, 22.641), destination], // Starting point is fixed, update if needed
        routeWhileDragging: true
      }).addTo(this.map);
    }
  }

  exportRouteToGoogleMaps(): void {
    const baseUrl = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&waypoints=';
    const waypoints = this.routePoints.map(point => `${point.latitude},${point.longitude}`).join('|');
    const url = `${baseUrl}${waypoints}`;
    window.open(url, '_blank');
  }
}
