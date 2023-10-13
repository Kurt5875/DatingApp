using API.Extensions;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Helpers
{
    public class LogUserActivity : IAsyncActionFilter
    {
        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var actionContext = await next();
            if (!actionContext.HttpContext.User.Identity.IsAuthenticated) return;

            var userId = actionContext.HttpContext.User.GetUserId();
            var userRepo = actionContext.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
            var currentUser = await userRepo.GetUserByIdAsync(userId);

            currentUser.LastActive = DateTime.UtcNow;
            await userRepo.SaveAllChangesAsync();
        }
    }
}