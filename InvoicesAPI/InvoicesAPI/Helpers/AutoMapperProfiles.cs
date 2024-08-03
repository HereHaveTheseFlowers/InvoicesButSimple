using AutoMapper;
using InvoicesAPI.DTOs;
using InvoicesAPI.Entities;
using Microsoft.AspNetCore.Identity;

namespace InvoicesAPI.Helpers
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles()
        {
            CreateMap<IdentityUser, UserDTO>();
            CreateMap<InvoiceDTO, Invoice>().ReverseMap();
            CreateMap<InvoiceCreationDTO, Invoice>();
            CreateMap<InvoicePDFDTO, InvoicePDF>().ReverseMap();
            CreateMap<InvoicePDFCreationDTO, InvoicePDF>();
        }
    }
}
