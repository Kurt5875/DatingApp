using API.DTOs;
using API.Entities;
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

        public UsersController(IUserRepository userRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        #region First solution 

        // [HttpGet]
        // public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
        // {
        //     var users = await _userRepository.GetUsersAsync();
        //     return Ok(_mapper.Map<IEnumerable<MemberDto>>(users));
        // }

        // [HttpGet("{id:int}")]
        // public async Task<ActionResult<MemberDto>> GetUser(int id)
        // {
        //     var user = await _userRepository.GetUserByIdAsync(id);
        //     return _mapper.Map<MemberDto>(user);
        // }

        // [HttpGet("{username}")]
        // public async Task<ActionResult<MemberDto>> GetUser(string username)
        // {
        //     var user = await _userRepository.GetUserByUsernameAsync(username);
        //     return _mapper.Map<MemberDto>(user);
        // }

        #endregion

        #region Second solution (better for performance)

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDto>>> GetMembers()
        {
            var members = await _userRepository.GetMembersAsync();
            return Ok(members);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<MemberDto>> GetMember(int id)
        {
            return await _userRepository.GetMemberByIdAsync(id);
        }

        [HttpGet("{username}")]
        public async Task<ActionResult<MemberDto>> GetMember(string username)
        {
            return await _userRepository.GetMemberByUsernameAsync(username);
        }

        #endregion
    }
}