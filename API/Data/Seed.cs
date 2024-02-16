using System.Text.Json;
using API.Entities;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class Seed
    {
        private const string UserPasswordConfigKey = "UserPassword";

        public static async Task SeedUsers(UserManager<AppUser> userManager, RoleManager<AppRole> roleManager,
            IConfiguration config)
        {
            if (await userManager.Users.AnyAsync())
            {
                return;
            }

            var userData = await File.ReadAllTextAsync("Data/UserSeedData.json");
            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var users = JsonSerializer.Deserialize<List<AppUser>>(userData, options);
            var roles = new List<AppRole> {
                new() { Name = "Member"},
                new() { Name = "Moderator"},
                new() { Name = "Admin"},
            };

            foreach (var role in roles)
            {
                await roleManager.CreateAsync(role);
            }

            foreach (var user in users)
            {
                user.UserName = user.UserName.ToLower();
                await userManager.CreateAsync(user, config.GetValue<string>(UserPasswordConfigKey));
                await userManager.AddToRoleAsync(user, "Member");
            }

            var administrator = new AppUser
            {
                UserName = "administrator"
            };

            await userManager.CreateAsync(administrator, config.GetValue<string>(UserPasswordConfigKey));
            await userManager.AddToRolesAsync(administrator, roles.Select(r => r.Name));
        }
    }
}