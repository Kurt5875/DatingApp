using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class MessagesController : BaseApiController
    {
        private readonly IUserRepository _userRepository;

        private readonly IMessageRepository _messageRepository;

        private readonly IMapper _mapper;

        public MessagesController(IUserRepository userRepository, IMessageRepository messageRepository, IMapper mapper)
        {
            _userRepository = userRepository;
            _messageRepository = messageRepository;
            _mapper = mapper;
        }

        [HttpPost()]
        public async Task<ActionResult<Message>> CreateMessage(CreateMessageDto createMessageDto)
        {
            var username = User.GetUsername();
            var recipientUsername = createMessageDto.RecipientUsername;

            if (string.IsNullOrEmpty(recipientUsername))
                return BadRequest("The recipient username must be provided");

            if (username == recipientUsername.ToLower())
                return BadRequest("You cannot send messages to yourself");

            var sender = await _userRepository.GetUserByUsernameAsync(username);
            var recipient = await _userRepository.GetUserByUsernameAsync(recipientUsername);

            if (recipient == null) return NotFound();

            var message = new Message
            {
                Sender = sender,
                SenderUsername = username,
                Recipient = recipient,
                RecipientUsername = recipientUsername,
                Content = createMessageDto.Content
            };

            _messageRepository.AddMessage(message);

            if (await _messageRepository.SaveAllAsync()) return Ok(_mapper.Map<MessageDto>(message));

            return BadRequest("Failed to send message");
        }

        [HttpGet()]
        public async Task<ActionResult<PagedList<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
        {
            messageParams.Username = User.GetUsername();

            var messages = await _messageRepository.GetMessagesForUser(messageParams);

            Response.AddPaginationHeader(new PaginationHeader(messages.CurrentPage, messages.TotalPages,
                messages.PageSize, messages.TotalCount));

            return Ok(messages);
        }

        [HttpGet("thread/{targetUsername}")]
        public async Task<IEnumerable<MessageDto>> GetMessageThread(string targetUsername)
        {
            return await _messageRepository.GetMessageThread(User.GetUsername(),
                targetUsername);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMessage(int id)
        {
            var username = User.GetUsername();
            var message = await _messageRepository.GetMessage(id);

            if (message == null) return BadRequest();

            if (message.RecipientUsername != username && message.SenderUsername != username)
                return Unauthorized();

            if (message.RecipientUsername == username) message.RecipientDeleted = true;
            if (message.SenderUsername == username) message.SenderDeleted = true;

            if (message.RecipientDeleted && message.SenderDeleted)
            {
                _messageRepository.DeleteMessage(message);
            }

            if (await _messageRepository.SaveAllAsync())
            {
                return Ok();
            }

            return BadRequest("Problem deleting the message");
        }
    }
}