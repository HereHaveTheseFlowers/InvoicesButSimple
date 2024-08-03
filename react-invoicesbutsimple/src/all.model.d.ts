
export interface userDTO {
    id: number;
    name: string;
}

export interface InvoiceDTO {
    id: string;
    userId: string;
    invoiceId: string;
    invoiceNumber: string;
    buyer: string;
    date: string;
    totalCost: string;
}

export interface InvoicePDFDTO {
    id: string;
    jsonString: string;
}

export type InvoiceFormDataDTO = {
    BuyerAdress: string;
    BuyerBIK: string;
    BuyerEmail: string;
    BuyerFullName: string;
    BuyerINN: string;
    BuyerKPP: string;
    BuyerKS: string;
    BuyerName: string;
    BuyerPhoneNumber: string;
    BuyerRS: string;
    InvoiceDate: string;
    InvoiceNumber: string;
    ItemAmount1: string;
    ItemName1: string;
    ItemPrice1: string;
    ItemType1: string;
    SellerAdress: string;
    SellerBIK: string;
    SellerEmail: string;
    SellerFullName: string;
    SellerINN: string;
    SellerKPP: string;
    SellerKS: string;
    SellerName: string;
    SellerPhoneNumber: string;
    SellerRS: string;
    TaxAmount: string;
    TaxName: string;
}
