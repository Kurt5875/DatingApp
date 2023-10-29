using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class LikesController : BaseApiController
    {
        private readonly IUserRepository _userRepository;

        private readonly ILikeRepository _likeRepository;

        public LikesController(IUserRepository userRepository, ILikeRepository likeRepository)
        {
            _userRepository = userRepository;
            _likeRepository = likeRepository;
        }

        [HttpPost("{username}")]
        public async Task<ActionResult> AddLike(string username)
        {
            var likedUser = await _userRepository.GetUserByUsernameAsync(username);
            var sourceUser = await _likeRepository.GetUserWithLikes(User.GetUserId());

            if (likedUser == null) return NotFound();

            if (likedUser.UserName == sourceUser.UserName) return BadRequest("You cannot like yourself");

            var userLike = await _likeRepository.GetUserLike(sourceUser.Id, likedUser.Id);

            if (userLike != null) return BadRequest("You already like this user");

            sourceUser.LikedUsers.Add(new UserLike
            {
                SourceUserId = sourceUser.Id,
                TargetUserId = likedUser.Id
            });

            if (await _userRepository.SaveAllChangesAsync()) return Ok();

            return BadRequest("Failed to like user");
        }

        [HttpGet()]
        public async Task<ActionResult<PagedList<LikeDto>>> GetUserLikes([FromQuery] LikeParams likeParams)
        {
            likeParams.UserId = User.GetUserId();
            var userLikes = await _likeRepository.GetUserLikes(likeParams);

            PaginationHeader paginationHeader = new(userLikes.CurrentPage, userLikes.TotalPages,
                userLikes.PageSize, userLikes.TotalCount);

            HttpContext.Response.AddPaginationHeader(paginationHeader);

            return Ok(userLikes);
        }
    }
}