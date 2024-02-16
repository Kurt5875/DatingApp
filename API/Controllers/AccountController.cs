using System.Globalization;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class AccountController : BaseApiController
    {
        private readonly UserManager<AppUser> _userManager;

        private readonly ITokenService _tokenService;

        private readonly IUserRepository _userRepository;

        private readonly IMapper _mapper;

        public AccountController(UserManager<AppUser> userManager, ITokenService tokenService, IUserRepository userRepository,
            IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
            _tokenService = tokenService;
            _userRepository = userRepository;
        }

        #region Register with QueryString

        // [HttpPost("register_qs")] // POST : api/account/register?username=sam&password=password
        // public async Task<AppUser> RegisterWithQueryString(string userName, string password)
        // {
        //     var user = new AppUser
        //     {
        //         UserName = userName
        //     };

        //     await _userManager.CreateAsync(user, password);

        //     return user;
        // }

        #endregion

        [HttpPost("register")]
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await UserExists(registerDto.UserName))
            {
                return BadRequest("The specified username already exists!");
            }

            var user = _mapper.Map<AppUser>(registerDto);
            user.UserName = registerDto.UserName.ToLower();

            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var roleResult = await _userManager.AddToRoleAsync(user, "Member");
            if (!roleResult.Succeeded) return BadRequest(result.Errors);

            return new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = null,
                KnownAs = user.KnownAs,
                Gender = user.Gender
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _userManager.Users
                .Include(u => u.Photos)
                .FirstOrDefaultAsync(u => u.UserName == loginDto.UserName.ToLower());

            if (user == null)
            {
                return Unauthorized(
                    string.Format(CultureInfo.InvariantCulture, "The user: {0} does not exists!", loginDto.UserName));
            }

            var result = await _userManager.CheckPasswordAsync(user, loginDto.Password);
            if (!result) return Unauthorized("Invalid password!");

            return new UserDto
            {
                UserName = user.UserName,
                Token = await _tokenService.CreateToken(user),
                PhotoUrl = user.Photos.FirstOrDefault(p => p.IsMain)?.Url,
                KnownAs = user.KnownAs,
                Gender = user.Gender
            };
        }

        private async Task<bool> UserExists(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
    }
}