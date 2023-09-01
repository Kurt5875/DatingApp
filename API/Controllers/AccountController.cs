using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly DataContext _context;

        private readonly ITokenService _tokenService;

        private readonly IUserRepository _userRepository;

        public AccountController(DataContext context, ITokenService tokenService, IUserRepository userRepository)
        {
            _context = context;
            _tokenService = tokenService;
            _userRepository = userRepository;
        }

        #region Register with QueryString

        [HttpPost("register_qs")] // POST : api/account/register?username=sam&password=password
        public async Task<AppUser> RegisterWithQueryString(string userName, string password)
        {
            using var hmac = new HMACSHA512();

            var user = new AppUser
            {
                UserName = userName,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password)),
                PasswordSalt = hmac.Key,
            };

            await _context.Users.AddAsync(user);

            return user;
        }

        #endregion

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.UserName))
            {
                return BadRequest("The specified username already exists!");
            }

            using var hmac = new HMACSHA512();

            var user = new AppUser
            {
                UserName = registerDto.UserName.ToLower(),
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key,
            };

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return new UserDto
            {
                UserName = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = null
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var username = loginDto.UserName;
            var user = await _userRepository.GetUserByUsernameAsync(username.ToLower());

            if (user == null)
            {
                return Unauthorized(
                    string.Format(CultureInfo.InvariantCulture, "The user: {0} does not exists!", username));
            }

            using var hmac = new HMACSHA512(user.PasswordSalt);
            var computeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computeHash.Length; i++)
            {
                if (computeHash[i] != user.PasswordHash[i])
                {
                    return Unauthorized(
                        string.Format(CultureInfo.InvariantCulture, "The password for user: {0} is incorrect!", username));
                }
            }

            return new UserDto
            {
                UserName = user.UserName,
                Token = _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url
            };
        }

        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}