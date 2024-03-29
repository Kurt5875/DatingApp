using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class MessageRepository : IMessageRepository
    {
        private readonly DataContext _context;

        private readonly IMapper _mapper;

        public MessageRepository(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public void AddMessage(Message message)
        {
            _context.Messages.Add(message);
        }

        public void DeleteMessage(Message message)
        {
            _context.Messages.Remove(message);
        }

        public async Task<Message> GetMessage(int id)
        {
            return await _context.Messages.FindAsync(id);
        }

        public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
        {
            var usernameParams = messageParams.Username;
            var query = _context.Messages
                .OrderByDescending(x => x.DateMessageSent)
                .AsQueryable();

            query = messageParams.Container switch
            {
                "Inbox" => query.Where(m => m.RecipientUsername == usernameParams
                    && !m.RecipientDeleted),
                "Outbox" => query.Where(m => m.SenderUsername == usernameParams
                    && !m.SenderDeleted),
                _ => query.Where(m => m.RecipientUsername == usernameParams
                    && m.DateRead == null && !m.RecipientDeleted)
            };

            return await PagedList<MessageDto>.CreateAsync(
                query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider).AsNoTracking(),
                messageParams.PageNumber,
                messageParams.PageSize);
        }

        public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string targetUsername)
        {
            var messages = await _context.Messages
                .Include(m => m.Sender).ThenInclude(u => u.Photos)
                .Include(m => m.Recipient).ThenInclude(u => u.Photos)
                .Where(m => m.RecipientUsername == currentUsername && !m.RecipientDeleted && m.SenderUsername == targetUsername
                    || m.SenderUsername == currentUsername && !m.SenderDeleted && m.RecipientUsername == targetUsername)
                .OrderBy(m => m.DateMessageSent)
                .ToListAsync();

            var unreadMessages = messages.Where(m => m.DateRead == null && m.RecipientUsername == currentUsername).ToList();

            if (unreadMessages.Any())
            {
                foreach (var message in unreadMessages)
                {
                    message.DateRead = DateTime.UtcNow;
                }

                await SaveAllAsync();
            }

            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}