using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InvoicesAPI.DTOs
{
    public class InvoiceCreationDTO
    {
        public string InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public string Buyer { get; set; }
        public string Date { get; set; }
        public string TotalCost { get; set; }
    }
}
