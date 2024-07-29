namespace RouteMapping.Server.Data
{
    using Microsoft.EntityFrameworkCore;
    using NetTopologySuite.Geometries;
    using RouteMapping.Server.Models;

    public class ApplicationDbContext : DbContext
    {
        public DbSet<Route> Routes { get; set; }
        public DbSet<Waypoint> Waypoints { get; set; }
        public DbSet<SavedRoute> SavedRoutes { get; set; }

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)   
            : base(options)
        {
        }
    }
}
