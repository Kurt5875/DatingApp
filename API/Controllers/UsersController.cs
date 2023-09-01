using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;

        private readonly IMapper _mapper;

        private readonly IPhotoService _photoService;

        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserRepository userRepository, IMapper mapper, IPhotoService photoService,
            ILogger<UsersController> logger)
        {
            _photoService = photoService;
            _logger = logger;
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        {
            var members = await _userRepository.GetMembersAsync();
            return Ok(members);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<MemberDto>> GetUser(int id)
        {
            // _logger.Log(LogLevel.Information, "---- Called method : GetMember (id: " + id + ") ----");

            return await _userRepository.GetMemberByIdAsync(id);
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetUser(string username)
        {
            // _logger.Log(LogLevel.Information, "---- Called method : GetMember (username: " + username + ") ----");

            return await _userRepository.GetMemberByUsernameAsync(username);
        }

        [HttpPut]
        public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            if (user == null) return NotFound();

            _mapper.Map(memberUpdateDto, user);

            if (await _userRepository.SaveAllChangesAsync()) return NoContent();

            return BadRequest("Failed to update user, or nothing to update!");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            if (user == null) return NotFound();

            var result = await _photoService.AddPhotoAsync(file);

            if (result.Error != null) return BadRequest(result.Error.Message);

            var photo = new Photo
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId,
                IsMain = user.Photos.Count == 0
            };

            user.Photos.Add(photo);

            if (await _userRepository.SaveAllChangesAsync())
            {
                return CreatedAtAction(
                    actionName: nameof(GetUser),
                    routeValues: new { username = user.UserName },
                    _mapper.Map<PhotoDto>(photo));
            }

            return BadRequest("An error occured while uploading photo !");
        }

        [HttpPut("set-main-photo/{id:int}")]
        public async Task<ActionResult> SetMainPhoto(int id)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            if (user == null) return NotFound();

            var photos = new List<Photo>(user.Photos);
            var photoToUpdate = photos.FirstOrDefault(p => p.Id == id);

            if (photos.Count == 0 || photoToUpdate == null || photoToUpdate.IsMain)
            {
                return NotFound("No photo(s) found for user, or photo is already the user main photo");
            }

            photos.ForEach(p => p.IsMain = p.Id == id);
            user.Photos = photos;

            if (await _userRepository.SaveAllChangesAsync()) return NoContent();

            return BadRequest("An error occured while setting main photo !");
        }

        [HttpDelete("delete-photo/{id:int}")]
        public async Task<ActionResult> DeletePhoto(int id)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());
            if (user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(p => p.Id == id);
            if (photo == null) return NotFound();

            if (photo.IsMain) return BadRequest("You can not delete the main photo !");

            if (photo.PublicId != null)
            {
                var result = await _photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error);
            }

            user.Photos.Remove(photo);

            if (await _userRepository.SaveAllChangesAsync()) return Ok();

            return BadRequest("An error occured while deleting the photo !");
        }
    }
}