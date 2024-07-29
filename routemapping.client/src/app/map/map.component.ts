import { Component, OnInit } from '@angular/core';
import { tileLayer, latLng, Map } from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  options = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '...' })
    ],
    zoom: 13,
    center: latLng(41.437, 22.641) // Centered on Strumica
  };

  constructor() { }

  ngOnInit() {
  }
}
