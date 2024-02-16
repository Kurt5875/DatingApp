using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace API.Services
{
    public class TokenService : ITokenService
    {
        private readonly SymmetricSecurityKey _key;

        private readonly UserManager<AppUser> _userManager;

        public TokenService(IConfiguration configuration, UserManager<AppUser> userManager)
        {
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["TokenKey"]));
            _userManager = userManager;
        }

        public async Task<string> CreateToken(AppUser user)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.NameId, user.Id.ToString()),
                new(JwtRegisteredClaimNames.UniqueName, user.UserName)
            };

            var roles = await _userManager.GetRolesAsync(user);
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

            var credentials = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = credentials
            };

            return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
        }
    }
}