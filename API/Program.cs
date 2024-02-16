using API.Data;
using API.Entities;
using API.Extensions;
using API.Middleware;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

// Web Application (middleware)
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(builder => builder.WithOrigins(new string[] { "http://localhost:4200", "https://localhost:4200" })
    .AllowAnyHeader()
    .AllowAnyMethod());

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();

using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetRequiredService<DataContext>();
    var userManager = services.GetRequiredService<UserManager<AppUser>>();
    var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

    await context.Database.MigrateAsync();
    await Seed.SeedUsers(userManager, roleManager, builder.Configuration);
}
catch (Exception ex)
{
    var logger = services.GetService<ILogger<Program>>();
    logger.Log(LogLevel.Error, ex, ex.Message);
}

app.Run();