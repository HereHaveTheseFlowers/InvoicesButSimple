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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace InvoicesAPI.Controllers
{
    [Route("api/invoices")]
    [ApiController]
    public class InvoicesController : ControllerBase
    {
        private readonly IMapper mapper;

        private readonly ApplicationDbContext context;
        public InvoicesController(ApplicationDbContext context, IMapper mapper)
        {
            this.context = context;
            this.mapper = mapper;
        }

        [HttpGet] // api/invoices
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<List<InvoiceDTO>>> Get([FromQuery] PaginationDTO paginationDTO)
        {
            var email = HttpContext.User.Claims.First().Value;
            var queryable = context.Invoices.AsQueryable();

            await HttpContext.InsertParametersPaginationInHeader(queryable);

            var invoices = await queryable.Where(x => x.UserEmail == email).OrderBy(x => x.Date).Paginate(paginationDTO).ToListAsync();
            return mapper.Map<List<InvoiceDTO>>(invoices);
        }

        [HttpGet("{Id}")] // api/invoices/1
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult<InvoiceDTO>> Get(string Id)
        {
            var invoice = await context.Invoices.FirstOrDefaultAsync(x => x.InvoiceId == Id);

            if (invoice == null)
            {
                return NotFound();

            }

            return mapper.Map<InvoiceDTO>(invoice);
        }


        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Post([FromBody] InvoiceCreationDTO invoiceCreationDTO)
        {
            var UserEmail = HttpContext.User.Claims.First().Value;
            var invoice = mapper.Map<Invoice>(invoiceCreationDTO);
            invoice.UserEmail = UserEmail;
            context.Add(invoice);
            await context.SaveChangesAsync();
            return NoContent();

        }

        [HttpPut("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Put(string id, [FromBody] InvoiceCreationDTO invoiceCreationDTO)
        {
            var invoice = await context.Invoices.FirstOrDefaultAsync(x => x.InvoiceId == id);

            if (invoice == null)
            {
                return NotFound();

            }
            invoice = mapper.Map(invoiceCreationDTO, invoice);
            await context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public async Task<ActionResult> Delete(string id)
        {

            var exists = await context.Invoices.FirstOrDefaultAsync(x => x.InvoiceId == id);

            if (exists == null)
            {
                return NotFound();
            }
            context.Remove(exists);
            await context.SaveChangesAsync();
            return NoContent();
        }
    }
}
