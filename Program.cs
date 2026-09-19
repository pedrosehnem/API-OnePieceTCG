var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var cartas = new List<CartaDto>
{
    new CartaDto(1, "Edward Newgate OP17-001"),
    new CartaDto(2, "Atmos OP17-002")
};

app.MapGet("/", () => "Lista da cartas de One Piece TCG está no ar!");

app.MapGet("/api/cartas", () =>
{
    return Results.Ok(cartas);  
});

app.MapGet("api/cartas/{id:int}", (int id) =>
{
    var carta = cartas.Find(cartaDaLista => cartaDaLista.Id == id);

    if (carta is null)
    {
        return Results.NotFound();
    }

    return Results.Ok(carta);
});

app.MapPost("/api/cartas", (CartaEntradaDto dados) =>
{
    int proximoId = cartas.Count == 0
        ? 1
        : cartas.Max(carta => carta.Id) + 1;

    var novaCarta = new CartaDto(proximoId, dados.NomeDaCarta);

    cartas.Add(novaCarta);

    return Results.Created($"/api/cartas/{novaCarta.Id}", novaCarta);
});

app.MapPut("/api/cartas/{id:int}", (int id, CartaEntradaDto dados) =>
{
    int indice = cartas.FindIndex(cartaDaLista => cartaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound();
    }
    var cartaAtualizada = new CartaDto(id, dados.NomeDaCarta);
    cartas[indice] = cartaAtualizada;
    return Results.Ok(cartaAtualizada);
});

app.MapDelete("/api/cartas/{id:int}", (int id) =>
{
    int indice = cartas.FindIndex(cartaDaLista => cartaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound();
    }
    cartas.RemoveAt(indice);
    return Results.NoContent();
});
app.MapGet ("/api/cartas/confirmarexclusao/{id:int}", (int id) => {
int indice = cartas.FindIndex(cartaDaLista => cartaDaLista.Id == id);
    if(indice == -1)
    {
        return Results.NotFound("Carta não existe");
    }
    return Results.Ok("A carta ainda existe");
});
app.Run();

record CartaDto(int Id, string NomeDaCarta);
record CartaEntradaDto(string NomeDaCarta);