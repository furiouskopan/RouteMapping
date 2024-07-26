namespace RouteMapping.Server.Models
{
    public class Route
    {
        public int Id { get; set; }
        public string StartPoint { get; set; }
        public List<Waypoint> Waypoints { get; set; }
        public TimeSpan TotalTime { get; set; }
        public double Distance { get; set; }
    }
}
