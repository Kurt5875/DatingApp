using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces
{
    public interface IUserRepository
    {
        Task<AppUser> GetUserByIdAsync(int id);

        Task<AppUser> GetUserByUsernameAsync(string username);

        Task<MemberDto> GetMemberByIdAsync(int id);

        Task<MemberDto> GetMemberByUsernameAsync(string username);

        Task<PagedList<MemberDto>> GetMembersAsync(UserParams userParams);

        void Update(AppUser user);

        Task<bool> SaveAllChangesAsync();
    }
}