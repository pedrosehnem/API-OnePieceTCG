using ApiOnePieceTCG.Data;
using ApiOnePieceTCG.Models;
using Microsoft.EntityFrameworkCore;
using ApiOnePieceTCG.DTOs;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

builder.Services.AddDbContext<ApiDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
var app = builder.Build();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(new
        {
            mensagem = "Ocorreu um erro interno. Tente novamente mais tarde."
        });
    });
});
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
// var cartas = new List<CartaDto>
    // {
    //     new CartaDto(1, "Edward Newgate OP17-001"),
    //     new CartaDto(2, "Atmos OP17-002")
    // };

app.MapGet("/api/status", () => "API One Piece TCG está no ar!");
app.MapGet("/api/teste-erro", () =>
{
    throw new InvalidOperationException("Falha simulada para teste.");
});
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
app.MapPost("/api/cartas", async (CartaEntradaDto dados, ApiDbContext db) =>
{
    var carta = new CartaEntity
    {
        NomeDaCarta = dados.NomeDaCarta
    };

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

app.MapPut("/api/cartas/{id:int}", async (int id, CartaEntradaDto dados, ApiDbContext db) =>
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
app.MapGet("/api/cartas/confirmarexclusao/{id:int}", async (int id, ApiDbContext db) =>
{
    bool cartaExiste = await db.Cartas.AnyAsync(carta => carta.Id == id);

    if (!cartaExiste)
    {
        return Results.NotFound(new
        {
            mensagem = "Carta não encontrada. Exclusão confirmada."
        });
    }

    return Results.Ok(new
    {
        mensagem = "A carta ainda existe no banco de dados."
    });
});
app.Run();


//record CartaDto(int Id, string NomeDaCarta);
//record CartaEntradaDto(string NomeDaCarta);