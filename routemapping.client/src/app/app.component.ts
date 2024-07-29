// src/app/app.component.ts
import { Component } from '@angular/core';
import { tileLayer, latLng } from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 13,
    center: latLng(41.437, 22.641) // Centered on Strumica
  };

  constructor() { }
}
