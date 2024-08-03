using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using InvoicesAPI.Entities;
using AutoMapper;
using InvoicesAPI.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using InvoicesAPI.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;

namespace InvoicesAPI.Controllers
{
    [Route("api/invoicepdf")]
    [ApiController]
    public class InvoicePDFController : ControllerBase
    {
        private readonly IMapper mapper;

        private readonly ApplicationDbContext context;
        public InvoicePDFController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet("{Id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<InvoicePDFDTO>> Get(string Id)
        {
            var invoicePDF = await context.InvoicesPDF.FirstOrDefaultAsync(x => x.Id == Id);

            if (invoicePDF == null)
            {
                return NotFound();
        
            }

            return mapper.Map<InvoicePDFDTO>(invoicePDF);
        }

        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Post([FromBody] InvoicePDFCreationDTO invoicePDFCreationDTO)
        {
            var invoicePDF = mapper.Map<InvoicePDF>(invoicePDFCreationDTO);
            context.Add(invoicePDF);
            await context.SaveChangesAsync();
            return NoContent();
   
        }

        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Delete(string id)
        {
            var exists = await context.InvoicesPDF.AnyAsync(x => x.Id == id);

            if (!exists)
            {
                return NotFound();
            }
            context.Remove(new InvoicePDF() { Id = id });
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
