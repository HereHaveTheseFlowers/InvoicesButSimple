import { useContext, useEffect, useState } from "react";
import { logout } from "../auth/handleJWT";
import { Button } from "../components";
import AuthenticationContext from "../auth/AuthenticationContext";
import axios, { AxiosResponse } from "axios";
import { InvoiceDTO, InvoiceFormDataDTO } from "../all.model";
import { InvoicePDFDTO } from "../all.model";
import {urlInvoices, urlInvoicesPDF} from '../endpoints';
import downloadsvg from '../assets/downloadsvg.svg';
import makeid from '../utils/makeid';
import { validateForm, validateInput } from '../utils/validate';
import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";
import downloadjs from "downloadjs";
import fontkit from '@pdf-lib/fontkit';
import Authorized from "../auth/Authorized";

export default function AppPage() {
    const {update, claims} = useContext(AuthenticationContext);
    const [invoices, setInvoices] = useState<InvoiceDTO[]>([]);
    const [loadingInvoicesList, setLoadingInvoicesList] = useState(true);

    // Download the font
    let openSansBytes: string | ArrayBuffer = "";
    (async () => {
        openSansBytes = await fetch('http://herehavetheseflowers.com/OpenSans-Regular.ttf').then((res) => res.arrayBuffer());
    })();
    

    function isUser(){
        return claims.findIndex(claim => claim.name === 'exp' && Number(claim.value) > 0) > -1;
    }


    const generatedInvoiceNumber = makeid(20)

    const todayDate = new Date();
    const dd = String(todayDate.getDate()).padStart(2, '0');
    const mm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const yyyy = todayDate.getFullYear();

    const todayString = mm + '/' + dd + '/' + yyyy;

    
    useEffect(() => {
        axios.get(urlInvoices)
            .then((response: AxiosResponse<InvoiceDTO[]>) => {
                if(response.data) {
                    setInvoices(response.data);
                }
                setLoadingInvoicesList(false)
            })
            .catch((response: any) =>
            {
                setLoadingInvoicesList(false)
            })
    }, [])

    function downloadPdf(InvoiceID: string){
        axios.get(`${urlInvoicesPDF}/${InvoiceID}`)
            .then((response: any) => {
                if(response.data) {
                    const outputDecoded: any = JSON.parse(response.data.jsonString)
                    console.log(outputDecoded)
                    handleMakePdf(outputDecoded, false);
                }
            })
            .catch((response: any) =>
            {
                console.log(response)
            })
    }
    function deletePdf(InvoiceID: string){
        axios.delete(`${urlInvoicesPDF}/${InvoiceID}`)
            .catch((response: any) =>
            {
                console.log(response)
            })
        axios.delete(`${urlInvoices}/${InvoiceID}`)
            .catch((response: any) =>
            {
                console.log(response)
            })
            setTimeout(()=>{
        axios.get(urlInvoices)
            .then((response: AxiosResponse<InvoiceDTO[]>) => {
                if(response.data) {
                    setInvoices(response.data);
                }
                setLoadingInvoicesList(false)
            })
            .catch((response: any) =>
            {
                setLoadingInvoicesList(false)
            })
        },50)
    }

    
    const [currency, setCurrency] = useState("₽");
    const currencySymbols = []
    const [itemCount, setItemCount] = useState(1);
    const [itemsArray, setItemsArray] = useState<React.ReactNode[]>([]);

    const handleCurrencyChange = (event: any) => {
        if(!event.target || event.target.selectedIndex === null) return
        setCurrency(event.target.value);
    }

    const handleItemPriceChange = (itemID: number) => {
        const amountNode = document.getElementById(`ItemAmount${itemID}`) as HTMLInputElement
        const priceNode = document.getElementById(`ItemPrice${itemID}`) as HTMLInputElement
        if(!amountNode || !priceNode) {
            document.getElementById(`ItemTotalPrice${itemID}`).textContent = `0 ${currency}`;
            document.getElementById('ItemsTotalPrice').textContent = `0 ${currency}`
            return
        }
        const amount = Number(amountNode.value)
        const price = Number(priceNode.value)
        if(!amount || !price) {
            document.getElementById(`ItemTotalPrice${itemID}`).textContent = `0 ${currency}`;
            document.getElementById('ItemsTotalPrice').textContent = `0 ${currency}`
            return
        }
        document.getElementById(`ItemTotalPrice${itemID}`).textContent = `${Math.round((amount * price) * 100) / 100} ${currency}`
        let totalPrice = 0;

        const allPrices = document.querySelectorAll('.invoiceForm__itemTotalPrice');

        for(let priceSpan of allPrices) {
            if( priceSpan && priceSpan.textContent) {
                totalPrice = totalPrice + Number(priceSpan.textContent.slice(0, priceSpan.textContent.indexOf(" ")));
            }
        }
        document.getElementById('ItemsTotalPrice').textContent = `${totalPrice} ${currency}`
    }

    const newItemTemplate = (itemID: number) => {
        if(!itemID) return
        return (
            <div className="row my-2" id={`Item${itemID}`} key={itemID}>
                <div className="col-4" data-tooltip="Обязательное поле.">
                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id={`ItemName${itemID}`} name={`ItemName${itemID}`}  ></input>
                </div>
                <div className="col-2" data-tooltip="Только цифры. Обязательное поле.">
                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id={`ItemPrice${itemID}`}  name={`ItemPrice${itemID}`} 
                    onChange={()=>{handleItemPriceChange(itemID)}}></input>
                </div>
                <div className="col-2" data-tooltip="Только целые числа. Обязательное поле.">
                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id={`ItemAmount${itemID}`} name={`ItemAmount${itemID}`}
                    onChange={()=>{handleItemPriceChange(itemID)}}></input>
                </div>
                <div className="col-2" >
                    <input className="invoiceForm__input form-control" type="text" id={`ItemType${itemID}`} name={`ItemType${itemID}`} defaultValue={"Шт."}></input>
                </div>
                <div className="col-2" >
                    <span className="invoiceForm__itemTotalPrice" id={`ItemTotalPrice${itemID}`}>0 {currency}</span>
                </div>
            </div>
        )
    }

    const handleAddItem = () => {
        const newItemCount = itemCount + 1;
        setItemsArray(
            [
                ...itemsArray,
                
            newItemTemplate(newItemCount)
        ])
        setItemCount(itemCount + 1)
    }

    const handleDeleteItem = () => {
        if(itemCount <= 1) return
        setItemsArray(
            itemsArray.filter((a: any) => a.props.id !== `Item${itemCount}`)
          );
        setTimeout(()=>{handleItemPriceChange(itemCount - 1)}, 50)
          
        setItemCount(itemCount - 1);
    }

    const handleValidation = (event: any) => {
        if(!event.target) return;
        if(!validateInput(event.target)) {
            event.target.parentElement.classList.add("custooltip")
            event.target.classList.add("error")
        } else {
            event.target.parentElement.classList.remove("custooltip")
            event.target.classList.remove("error")
        }
    }

    async function handleMakePdf (output: any, sendToServer = true) {
        // Create a Pdf
        const data: any = output as InvoiceFormDataDTO;
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([630, 891]);
        const { width, height } = page.getSize()
        //const HelveticaFont = await pdfDoc.embedFont(StandardFonts.Courier)
        // Embed the font
        pdfDoc.registerFontkit(fontkit);
        const openSansFont = await pdfDoc.embedFont(openSansBytes);
/* 
        // Print all characters supported by the font
        const supportedCharacters = openSansFont
            .getCharacterSet()
            .map((codePoint) => String.fromCodePoint(codePoint))
            .join('');
        console.log(`Characters supported by font: ${supportedCharacters}\n`);

        // Print whether each character in the string 'фыв' is supported by the font
        'фыв'.split('').forEach((c) => {
            console.log(`Font supports ${c}? ${supportedCharacters.includes(c)}`);
        }); */



        let fontSize_header = 16;
        let fontSize_field = 12;
        let colorDarkBlue = rgb(0, 0.0235, 0.1411);
        let colorGrey = rgb(0.6, 0.6, 0.6);
        let colorBlack = rgb(0, 0, 0);
        let margin = 10;
        const pagePadding = 30;
        let currentpointY = 0;
    
        currentpointY += fontSize_header + pagePadding;
        page.drawText(`Счет на оплату №${data.InvoiceNumber} от ${data.InvoiceDate}`, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_header,
            font: openSansFont,
            color: colorBlack,
        })

        currentpointY += fontSize_field + (margin / 4);
        page.drawLine({
            start: { x: pagePadding, y: height - currentpointY },
            end: { x: width - pagePadding, y:  height - currentpointY },
            thickness: 2,
            color: colorGrey,
            opacity: 0.75,
        })
        currentpointY += fontSize_field + margin;
        page.drawText(`Продавец (Исполнитель):`, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        currentpointY += fontSize_field + margin;
        page.drawText(data.SellerName, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        currentpointY += fontSize_field + margin;
        page.drawText(`ФИО: ${data.SellerFullName}`, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        if(data.SellerAdress) {   
            currentpointY += fontSize_field + margin;
            page.drawText(`Адрес: ${data.SellerAdress}`, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let sellerContacts = "";
        if(data.SellerEmail) { sellerContacts += `Почта: ${data.SellerEmail}` }
        if(data.SellerPhoneNumber) { sellerContacts += ` Телефон: ${data.SellerPhoneNumber}` }
        if(sellerContacts) {   
            currentpointY += fontSize_field + margin;
            page.drawText(sellerContacts, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let sellerPaymentData1 = "";
        if(data.SellerINN) { sellerPaymentData1 += `ИНН: ${data.SellerINN}` }
        if(data.SellerKPP) { sellerPaymentData1 += ` КПП: ${data.SellerINN}` }
        if(data.SellerBIK) { sellerPaymentData1 += ` БИК: ${data.SellerBIK}` }
        if(sellerPaymentData1) {   
            currentpointY += fontSize_field + margin;
            page.drawText(sellerPaymentData1, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let sellerPaymentData2 = "";
        if(data.SellerRS) { sellerPaymentData2 += `Р/с: ${data.SellerRS}` }
        if(data.SellerKS) { sellerPaymentData2 += ` к/с: ${data.SellerKS}` }
        if(sellerPaymentData2) {   
            currentpointY += fontSize_field + margin;
            page.drawText(sellerPaymentData2, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        currentpointY += fontSize_field + (margin / 4);
        page.drawLine({
            start: { x: pagePadding, y: height - currentpointY },
            end: { x: width - pagePadding, y:  height - currentpointY },
            thickness: 2,
            color: colorGrey,
            opacity: 0.75,
        })

        // Buyer
        
        currentpointY += fontSize_field + margin;
        page.drawText(`Покупатель (Заказчик):`, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        currentpointY += fontSize_field + margin;
        page.drawText(data.BuyerName, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        if(data.BuyerFullName) {
            currentpointY += fontSize_field + margin;
            page.drawText(`ФИО: ${data.BuyerFullName}`, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        if(data.BuyerAdress) {   
            currentpointY += fontSize_field + margin;
            page.drawText(`Адрес: ${data.BuyerAdress}`, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let buyerContacts = "";
        if(data.BuyerEmail) { buyerContacts += `Почта: ${data.BuyerEmail}` }
        if(data.BuyerPhoneNumber) { buyerContacts += ` Телефон: ${data.BuyerPhoneNumber}` }
        if(buyerContacts) {   
            currentpointY += fontSize_field + margin;
            page.drawText(buyerContacts, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let buyerPaymentData1 = "";
        if(data.BuyerINN) { buyerPaymentData1 += `ИНН: ${data.BuyerINN}` }
        if(data.BuyerKPP) { buyerPaymentData1 += ` КПП: ${data.BuyerINN}` }
        if(data.BuyerBIK) { buyerPaymentData1 += ` БИК: ${data.BuyerBIK}` }
        if(buyerPaymentData1) {   
            currentpointY += fontSize_field + margin;
            page.drawText(buyerPaymentData1, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        let buyerPaymentData2 = "";
        if(data.BuyerRS) { buyerPaymentData2 += `Р/с: ${data.BuyerRS}` }
        if(data.BuyerKS) { buyerPaymentData2 += ` к/с: ${data.BuyerKS}` }
        if(buyerPaymentData2) {   
            currentpointY += fontSize_field + margin;
            page.drawText(buyerPaymentData2, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }
        currentpointY += fontSize_field + margin;
        page.drawText(`№`, {
            x: pagePadding+margin,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        page.drawText(`Наименование товара`, {
            x: pagePadding*2+margin,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        page.drawText(`Кол-во`, {
            x: pagePadding*10,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        page.drawText(`Ед. Изм`, {
            x: pagePadding*12+margin,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        page.drawText(`Цена`, {
            x: pagePadding*14+margin+margin,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })
        page.drawText(`Сумма`, {
            x: pagePadding*16+margin+margin+margin,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })




        let totalNumberOfItems = 0;

        for (const [key, value] of Object.entries(data)) {
            if(key.includes("ItemType")) {
                totalNumberOfItems++;
            }
        }
        page.drawRectangle({
            x: pagePadding - 2,
            y: height - currentpointY -  ((totalNumberOfItems + 1)*(fontSize_field+margin)) + fontSize_field + 2,
            width: width - pagePadding - pagePadding + 2,
            height: ((totalNumberOfItems + 1)*(fontSize_field+margin)),
            borderWidth: 2,
            borderColor: colorGrey,
            borderOpacity: 0.75,
        })
        let totalPrice = 0;
        for (let i = 0; i < totalNumberOfItems; i++) {
            currentpointY += fontSize_field + margin;
            page.drawText(String(i+1), {
                x: pagePadding+margin,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            page.drawText(data[`ItemName${i+1}`], {
                x: pagePadding*2+margin,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            page.drawText(data[`ItemAmount${i+1}`], {
                x: pagePadding*10,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            page.drawText(data[`ItemType${i+1}`], {
                x: pagePadding*12+margin,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            page.drawText(data[`ItemPrice${i+1}`], {
                x: pagePadding*14+margin+margin,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            const itemTotalPrice = Math.round((Number(data[`ItemPrice${i+1}`]) * Number(data[`ItemAmount${i+1}`])) * 100) / 100
            page.drawText(`${itemTotalPrice}  ${data.currency}`, {
                x: pagePadding*16+margin+margin+margin,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            totalPrice += itemTotalPrice;
        }
        currentpointY += fontSize_field + margin + 4;
        page.drawText(`Итого: ${totalPrice} ${data.currency}`, {
            x: pagePadding,
            y: height - currentpointY,
            size: fontSize_field,
            font: openSansFont,
            color: colorBlack,
        })

        if(data.TaxAmount) {
            currentpointY += fontSize_field + margin + 4;
            page.drawText(`${data.TaxName}: ${data.TaxAmount}%`, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
            currentpointY += fontSize_field + margin + 4;
            totalPrice = totalPrice + (Math.round((totalPrice / 100 * data.TaxAmount) / 100) * 100)
            page.drawText(`Всего к оплате: ${totalPrice} ${data.currency}`, {
                x: pagePadding,
                y: height - currentpointY,
                size: fontSize_field,
                font: openSansFont,
                color: colorBlack,
            })
        }


        // Serialize the PDFDocument to bytes (a Uint8Array)
        const pdfBytes = await pdfDoc.save()

        const pdfname = `Invoice-${output.InvoiceNumber}`;
        // Trigger the browser to download the PDF document
        downloadjs(pdfBytes, pdfname, "application/pdf");

        if(sendToServer && isUser()) {
            const newInvoiceId = makeid(40, true);
            const newInvoice = {
                "invoiceId": newInvoiceId,
                "invoiceNumber": data.InvoiceNumber,
                "buyer": data.BuyerName,
                "date": data.InvoiceDate,
                "totalCost": `${String(totalPrice)} ${data.currency}`
            }
            const jsonOutput = JSON.stringify(output)
            const newPDFInvoice = {
                "id": newInvoiceId,
                "jsonString": jsonOutput
            }
            axios.post(urlInvoices, newInvoice).then((response) => {
                console.log(response);
            })
            axios.post(urlInvoicesPDF, newPDFInvoice).then((response) => {
                console.log(response);
            })
            
            axios.get(urlInvoices)
            .then((response: AxiosResponse<InvoiceDTO[]>) => {
                if(response.data) {
                    setInvoices(response.data);
                }
                setLoadingInvoicesList(false)
            })
            .catch((response: any) =>
            {
                setLoadingInvoicesList(false)
            })
            setTimeout(()=>{
                window.location.reload();
            },300)
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formButtonSubmit = document.querySelector(".form__button_submit");
      if(!form || !formButtonSubmit) return;
      const formData = new FormData(form);
      if(!formData) return;
      const isValid = validateForm(formData);
      if(!isValid) {
        formButtonSubmit.classList.add("custooltip")
        formButtonSubmit.classList.add("error")
        return;
      } else {
        formButtonSubmit.classList.remove("custooltip")
        formButtonSubmit.classList.remove("error")
      }
      const output: Record<string, string> = {};
      for(const data of formData) {
        output[data[0].toString()] = data[1].toString();
      }
      handleMakePdf(output)

    }

    function getUserEmail(): string {
        return claims.filter(x => x.name === "email")[0]?.value;
    }

    return (
        <>
            <div className="app">

                <div className="container">
                    
                    <Authorized
                        authorized={<>
                            <div className="fw-bold my-2">Здравствуйте, {getUserEmail()}!</div>
                        
                    { invoices[0] ? <div>
                    <span className="fw-bold" style={{ fontSize: "24px" }}>Созданные счета:</span>
                    <table className="table app__invoicestable">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Номер Счета</th>
                                <th scope="col">Дата</th>
                                <th scope="col">Кому Отправлен</th>
                                <th scope="col">Итого</th>
                                <th scope="col">Скачать PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice: InvoiceDTO, index: any) => 
                                <tr key={invoice.id}>
                                    <th scope="row">{index}</th>
                                    <td>{invoice.invoiceNumber}</td>
                                    <td>{invoice.date}</td>
                                    <td>{invoice.buyer}</td>
                                    <td>{invoice.totalCost}</td>
                                    <td> 
                                        <Button onClick={()=>{downloadPdf(invoice.invoiceId)}} className='app__buttondownload'>
                                        <img src={downloadsvg}></img>
                                        </Button>
                                        <Button onClick={()=>{deletePdf(invoice.invoiceId)}} className='app__buttondelete'>
                                        X
                                        </Button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    </div> : <></> }
                            </>}
                            />
                    <span className="fw-bold" style={{ fontSize: "24px" }}>Создать новый счет:</span>
                    <span style={{ position: "absolute", right: 20, opacity: 0.5, fontStyle: "italic" }}>Обязательные поля подчеркнуты</span>
                    
                    <form className="invoiceForm container" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col p-2" data-tooltip="Обязательное поле.">
                                <label className="invoiceForm__label form-label form-label_required" htmlFor="InvoiceNumber" >Номер счета:</label>
                                <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" 
                                id="InvoiceNumber" name="InvoiceNumber" defaultValue={generatedInvoiceNumber}></input>
                            </div>
                            <div className="col p-2" data-tooltip="Дата должна быть в формате дд/мм/гггг.">
                                <label className="invoiceForm__label form-label form-label_required" htmlFor="InvoiceDate">Дата выставления:</label>
                                <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="InvoiceDate" 
                                name="InvoiceDate" defaultValue={todayString} placeholder="31/12/2024"></input>
                            </div>
                        </div>
                        <div className="col mx-5 my-2 p-2" style={{border: "3px dashed black"}}>
                            Продавец (Исполнитель):
                            <div className="row" >
                                <div className="col p-2" data-tooltip="Обязательное поле.">
                                    <label className="invoiceForm__label form-label form-label_required" htmlFor="SellerName">Название:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerName" name="SellerName" 
                                    placeholder="ООО 'Название', Название ИП, или ФИО"></input>
                                </div>
                                <div className="col p-2"> 
                                    <label className="invoiceForm__label form-label" htmlFor="SellerAdress">Адрес:</label>
                                    <input className="invoiceForm__input form-control" type="text" id="SellerAdress" name="SellerAdress"
                                    placeholder="Россия, г.Москва, Тверская ул., д. 10"></input>
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col py-2" data-tooltip="ИНН содержит 10 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerINN">ИНН:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerINN" name="SellerINN" placeholder="7701123456"></input>
                                </div>
                                <div className="col py-2" data-tooltip="КПП содержит 9 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerKPP">КПП:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerKPP" name="SellerKPP" placeholder="770201001"></input>
                                </div>
                                <div className="col py-2" data-tooltip="Расчетный счет содержит 20 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerRS">Расчетный счет:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="SellerRS" name="SellerRS" placeholder="40702810938000000001"></input>
                                </div>
                                <div className="col py-2" data-tooltip="БИК содержит 9 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerBIK">БИК:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="SellerBIK" name="SellerBIK" placeholder="044525225"></input>
                                </div>
                                <div className="col py-2" data-tooltip="Коррекционный счет содержит 20 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerKS">Кор. счет:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerKS" name="SellerKS" placeholder="30101810400000000225"></input>
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col p-2" data-tooltip="Обязательное поле.">
                                    <label className="invoiceForm__label form-label form-label_required" htmlFor="SellerFullName">ФИО:</label>
                                    <input  onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerFullName" name="SellerFullName" placeholder="Иванов Иван Иванович"></input>
                                </div>
                                <div className="col p-2" data-tooltip="Почтовый ящик введен некорректно">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerEmail">Почтовый ящик:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerEmail" name="SellerEmail" placeholder="example@gmail.com"></input>
                                </div>
                                <div className="col p-2" data-tooltip="Только цифры, может начинаться с '+' (10-15)">
                                    <label className="invoiceForm__label form-label" htmlFor="SellerPhoneNumber">Номер телефона:</label>
                                    <input onBlur={handleValidation} className="invoiceForm__input form-control" type="text" id="SellerPhoneNumber" name="SellerPhoneNumber" placeholder="+79588182423"></input>
                                </div>
                            </div>
                        </div>

                        
                        <div className="col mx-5 my-2 p-2" style={{border: "3px dashed black"}}>
                            Покупатель (Заказчик):
                            <div className="row" >
                                <div className="col p-2"  data-tooltip="Обязательное поле.">
                                    <label className="invoiceForm__label form-label form-label_required" htmlFor="BuyerName">Название:</label>
                                    <input  onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerName" name="BuyerName" 
                                    placeholder="ООО 'Название', Название ИП, или ФИО"></input>
                                </div>
                                <div className="col p-2"> 
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerAdress">Адрес:</label>
                                    <input className="invoiceForm__input form-control" type="text" id="BuyerAdress" name="BuyerAdress"
                                    placeholder="Россия, г.Москва, Тверская ул., д. 10"></input>
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col p-2" data-tooltip="ИНН содержит 10 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerINN">ИНН:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerINN" name="BuyerINN" placeholder="7701123456"></input>
                                </div>
                                <div className="col p-2" data-tooltip="КПП содержит 9 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerKPP">КПП:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerKPP" name="BuyerKPP" placeholder="770201001"></input>
                                </div>
                                <div className="col py-2" data-tooltip="Расчетный счет содержит 20 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerRS">Расчетный счет:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerRS" name="BuyerRS" placeholder="40702810938000000001"></input>
                                </div>
                                <div className="col py-2" data-tooltip="БИК содержит 9 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerBIK">БИК:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerBIK" name="BuyerBIK" placeholder="044525225"></input>
                                </div>
                                <div className="col py-2" data-tooltip="Коррекционный счет содержит 20 цифр. Это поле можно оставить пустым.">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerKS">Кор. счет:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerKS" name="BuyerKS" placeholder="30101810400000000225"></input>
                                </div>
                            </div>
                            <div className="row" >
                                <div className="col p-2" >
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerFullName">ФИО:</label>
                                    <input className="invoiceForm__input form-control" type="text" id="BuyerFullName" name="BuyerFullName" placeholder="Иванов Иван Иванович"></input>
                                </div>
                                <div className="col p-2" data-tooltip="Почтовый ящик введен некорректно">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerEmail">Почтовый ящик:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerEmail" name="BuyerEmail" placeholder="example@gmail.com"></input>
                                </div>
                                <div className="col p-2" data-tooltip="Только цифры, может начинаться с '+' (10-15)">
                                    <label className="invoiceForm__label form-label" htmlFor="BuyerPhoneNumber">Номер телефона:</label>
                                    <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="BuyerPhoneNumber" name="BuyerPhoneNumber" placeholder="+79588182423"></input>
                                </div>
                            </div>
                        </div>

                        
                        <div className="row m-4">
                            
                            <div className="col p-2" >
                                <label className="invoiceForm__label form-label" htmlFor="TaxName">Название Налога:</label>
                                <input className="invoiceForm__input form-control" type="text" id="TaxName" name="TaxName" placeholder="НДС"></input>
                            </div>
                            <div className="col p-2" data-tooltip="Только цифры, целое число, не может быть больше 100.">
                                <label className="invoiceForm__label form-label" htmlFor="TaxAmount">Процент Налога:</label>
                                <input onBlur={handleValidation}  className="invoiceForm__input form-control" type="text" id="TaxAmount" name="TaxAmount" placeholder="20"></input>
                            </div>
                            <div className="col p-2">
                                <label className="invoiceForm__label form-label" htmlFor="currency">Валюта</label>
                                <select onChange={handleCurrencyChange} className="form-select" id="currency" aria-label="Валюта" name="currency" defaultValue={"руб."}>
                                    <option value="руб.">Российский Рубль</option>
                                    <option value="Br">Белорусский Рубль</option>
                                    <option value="$">Доллар США</option>
                                    <option value="€">Евро</option>
                                </select>
                            </div>
                        </div>



                        
                        <div className="col mx-5 my-2 p-2" style={{border: "3px dashed black"}} id="invoiceForm-items">
                            Наименование товара, работ, услуг, подлежащих оплате:
                            <div className="row" >
                                <div className="col-4 py-2" ><label className="invoiceForm__label form-label form-label_required">Наименование:</label></div>
                                <div className="col-2 py-2" ><label className="invoiceForm__label form-label form-label_required">Цена:</label></div>
                                <div className="col-2 py-2" ><label className="invoiceForm__label form-label form-label_required">Количество:</label></div>
                                <div className="col-2 py-2" ><label className="invoiceForm__label form-label">Ед.Измерения:</label></div>
                                <div className="col-2 py-2" ><label className="invoiceForm__label form-label">Итого:</label></div>
                            </div>
                            {newItemTemplate(1)}
                            {itemsArray}
                            

                            <div className="row  my-2">
                                <div className="col-4"></div>
                                <div className="col-2">
                                    <Button type="button" onClick={handleAddItem} className="btn btn-success">Добавить товар</Button>
                                </div>
                                <div className="col-2">
                                    <Button type="button" onClick={handleDeleteItem} className="btn btn-danger">Удалить товар</Button>
                                </div>
                                <div className="col-2"></div>
                                <div className="col-2">
                                    <span id="ItemsTotalPrice">0 {currency}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row ">
                            <div className="col align-self-center my-3">
                                <button className="form__button form__button_submit btn btn-primary" data-tooltip="Пожалуйста, проверьте что данные введены верно.">Сохранить</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
