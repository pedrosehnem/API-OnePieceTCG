using Microsoft.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
// var cartas = new List<CartaDto>
    // {
    //     new CartaDto(1, "Edward Newgate OP17-001"),
    //     new CartaDto(2, "Atmos OP17-002")
    // };

app.MapGet("/api/cartas", () => "API One Piece TCG está no ar!");

app.MapGet("/api/cartas", async (ApiDbContext db) =>
    await db.Cartas.ToListAsync());

// app.MapGet("api/cartas/{id:int}", (int id) =>
// {
//     var carta = cartas.Find(cartaDaLista => cartaDaLista.Id == id);

//     if (carta is null)
//     {
//         return Results.NotFound();
//     }

//     return Results.Ok(carta);
// });
app.MapGet("/api/cartas/{id:int}", async (int id, ApiDbContext db) =>
{
    var carta = await db.Cartas.FindAsync(id);

    if (carta is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(carta);
});
app.MapPost("/api/cartas", async (CartaEntity carta, ApiDbContext db) =>
{
    db.Cartas.Add(carta);
    await db.SaveChangesAsync();
    return Results.Created($"/api/cartas/{carta.Id}", carta);
});

/* app.MapPut("/api/cartas/{id:int}", (int id, CartaEntradaDto dados) =>
{
    int indice = cartas.FindIndex(cartaDaLista => cartaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound();
    }
    var cartaAtualizada = new CartaDto(id, dados.NomeDaCarta);
    cartas[indice] = cartaAtualizada;
    return Results.Ok(cartaAtualizada);
}); */

app.MapPut("/api/cartas/{id:int}", async (int id, CartaEntity dados, ApiDbContext db) =>
{
    var carta = await db.Cartas.FindAsync(id);
    if (carta is null)
    {
        return Results.NotFound();
    }
    carta.NomeDaCarta = dados.NomeDaCarta;
    await db.SaveChangesAsync();
    return Results.Ok(carta);

});


app.MapDelete("/api/cartas/{id:int}", async (int id, ApiDbContext db) =>
{
  var carta = await db.Cartas.FindAsync(id);
  if (carta is null) return Results.NotFound();
  db.Cartas.Remove(carta);
  await db.SaveChangesAsync();
  return Results.NoContent();

});
// app.MapGet ("/api/cartas/confirmarexclusao/{id:int}", (int id) => {
// int indice = cartas.FindIndex(cartaDaLista => cartaDaLista.Id == id);
//     if(indice == -1)
//     {
//         return Results.NotFound("Carta não existe");
//     }
//     return Results.Ok("A carta ainda existe");
// });
app.Run();

class CartaEntity
{
    public int Id { get; set; }
    public string NomeDaCarta { get; set; } = string.Empty;
}

class ApiDbContext : DbContext
{
    public ApiDbContext(DbContextOptions<ApiDbContext> options) : base(options)
    {
    }

    public DbSet<CartaEntity> Cartas => Set<CartaEntity>();
}
//record CartaDto(int Id, string NomeDaCarta);
//record CartaEntradaDto(string NomeDaCarta);