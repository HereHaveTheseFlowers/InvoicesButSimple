export function validateInput(input: HTMLInputElement): boolean {
    if(!input || !input.name) return false
    return validate(input.value, input.name)
}

function validate(value: string, inputType: string): boolean {
    let pattern = /(.?)+/
    let requirements = "";
    switch(inputType) {
        case "first_name":
        case "second_name":
            pattern = /^[A-ZА-ЯЁ][а-яА-ЯёЁa-zA-Z]{2,20}$/
            requirements = "Only letters, first letter should be uppercase. (2-20)"
            break;
        case "login":
        case "display_name":
            pattern = /^(?=.*[A-Za-z])[a-zA-Z0-9_-]{3,20}$/
            requirements = "Only letters, numbers, '-' and '_', at least one of them should be a letter. (3-20)"
            break;
        case "password":
        case "oldPassword":
        case "newPassword":
            pattern = /(?=^.{8,40}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z]).*$/
            requirements = "Any symbols. An uppercase letter and a number should be used. (min 8)"
            break;
        case "SellerName":
        case "BuyerName":
        case "InvoiceNumber":
        case "SellerFullName":
            pattern = /.+/
            break;
        case "InvoiceDate":
            pattern = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/
            break;
        case "SellerINN":
        case "BuyerINN":
            pattern = /^$|^[0-9]{10}$/
            break;
        case "SellerKPP":
        case "SellerBIK":
        case "BuyerKPP":
        case "BuyerBIK":
            pattern = /^$|^[0-9]{9}$/
            break;
        case "SellerRS":
        case "SellerKS":
        case "BuyerRS":
        case "BuyerKS":
            pattern = /^$|^[0-9]{20}$/
            break;
        case "SellerEmail":
        case "BuyerEmail":
            pattern = /^$|^[a-zA-Z0-9!_-]+@[A-z]([-A-z0-9]?)+\.[A-z]{2,5}$/
            break;
        case "SellerPhoneNumber":
        case "BuyerPhoneNumber":
            pattern = /^$|^[+]?\d{10,15}$/
            break;
        case "TaxAmount":
            pattern = /^$|^[1-9][0-9]?$|^100$/
            break;
    }
    if(inputType.includes("ItemName")) {
        pattern = /.+/
    } else if(inputType.includes("ItemPrice")) {
        pattern = /^([0-9]{1,10}.)?[0-9]{1,10}$/
    } else if(inputType.includes("ItemAmount")) {
        pattern = /^[1-9][0-9]{0,10}$/
    }
    if (pattern.test(value)) {
        return true
    }
    else {
        return  false
    }
}

export function validateForm(formData: FormData | undefined): boolean {
    if(!formData) return false;
    for(const key of formData.keys()) {
        if(!validate(formData.get(key) as string, key)) {

            return false;
        }
    }
    return true;
}
