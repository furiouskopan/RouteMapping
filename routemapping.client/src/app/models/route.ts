export interface Route {
  id: number;
  startPoint: string;
  waypoints: Waypoint[];
  totalTime: string;
  distance: number;
}

export interface Waypoint {
  id: number;
  routeId: number;
  locationName: string;
  latitude: number;
  longitude: number;
  timeFromStart: string;
}
