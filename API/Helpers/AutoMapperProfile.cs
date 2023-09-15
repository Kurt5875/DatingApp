using API.DTOs;
using API.Entities;
using API.Extensions;
using AutoMapper;

namespace API.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile()
        {
            CreateMap<AppUser, MemberDto>()
                .ForMember(dest => dest.PhotoUrl,
                    options => options.MapFrom(src => src.Photos.SingleOrDefault(x => x.IsMain).Url))
                .ForMember(dest => dest.Age,
                options => options.MapFrom(src => src.DateOfBirth.CalculateAge()));

            CreateMap<Photo, PhotoDto>();
            CreateMap<MemberUpdateDto, AppUser>();
            CreateMap<RegisterDto, AppUser>()
                .ForMember(
                    dest => dest.UserName,
                    options => options.MapFrom(src => src.UserName.ToLower()));
        }
    }
}