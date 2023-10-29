using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface ILikeRepository
    {
        Task<UserLike> GetUserLike(int sourceUserId, int targetUserId);

        Task<PagedList<LikeDto>> GetUserLikes(LikeParams likeParams);

        Task<AppUser> GetUserWithLikes(int userId);
    }
}