using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace InvoicesAPI.DTOs
{
    public class InvoicePDFDTO
    {
        public string Id { get; set; }
        public string JsonString { get; set; }
    }
}