namespace RouteMapping.Server.Models
{
    public class Waypoint
    {
        public int Id { get; set; }
        public int RouteId { get; set; }
        public string LocationName { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public TimeSpan TimeFromStart { get; set; }

        public Route Route { get; set; }
    }
}
