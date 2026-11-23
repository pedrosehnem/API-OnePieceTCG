namespace ApiOnePieceTCG.Data;
using Microsoft.EntityFrameworkCore;
using ApiOnePieceTCG.Models;
class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<CartaEntity> Cartas => Set<CartaEntity>();
}