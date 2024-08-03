
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace InvoicesAPI.Entities
{
    public class Invoice
    {
        public int Id { get; set; }
        public string UserEmail { get; set; }
        public string InvoiceId { get; set; }
        public string InvoiceNumber { get; set; }
        public string Buyer { get; set; }
        public string Date { get; set; }
        public string TotalCost { get; set; }
    }
}