using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using InvoicesAPI.Entities;
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace InvoicesAPI
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext([NotNullAttribute] DbContextOptions options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            base.OnModelCreating(modelBuilder);
        }


        public DbSet<InvoicePDF> InvoicesPDF { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
    }
}
