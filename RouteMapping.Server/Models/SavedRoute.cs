namespace RouteMapping.Server.Models
{
    using System;
    public class SavedRoute
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int RouteId { get; set; }
        public DateTime SavedAt { get; set; }

        public Route Route { get; set; }
    }
}
