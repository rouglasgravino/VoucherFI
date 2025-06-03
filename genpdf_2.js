// genpdf_2.js (Com rodapé adicionado)

const ICONS_SVG_STRINGS_V2 = {
    key: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="8" cy="15" r="4"></circle><line x1="10.85" y1="12.15" x2="19" y2="4"></line><line x1="18" y1="5" x2="20" y2="7"></line><line x1="15" y1="8" x2="17" y2="10"></line></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 15"></polyline></svg>`,
    wifi: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="12" y1="18" x2="12.01" y2="18"></line><path d="M9.172 15.172a4 4 0 0 1 5.656 0"></path><path d="M6.343 12.343a8 8 0 0 1 11.314 0"></path><path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 16.97 0"></path></svg>`
};

async function svgToPngDataURLV2(svgString, width = 32, height = 32, fillColor = 'black') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const scaleFactor = 2; 
        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;
        const ctx = canvas.getContext('2d');

        let coloredSvgString = svgString.replace(/currentColor/g, fillColor);
        if (!coloredSvgString.includes('stroke=')) {
            coloredSvgString = coloredSvgString.replace('<svg', `<svg stroke="${fillColor}"`);
        }
        if (!coloredSvgString.includes('fill=')) { 
            coloredSvgString = coloredSvgString.replace('<svg', `<svg fill="none"`);
        }

        const svgBlob = new Blob([coloredSvgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = function () {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            try {
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                console.error("Erro ao converter canvas para DataURL (V2):", e);
                reject(new Error("Falha ao converter SVG para PNG Data URL (V2): " + e.message));
            }
        };
        img.onerror = function (e) {
            URL.revokeObjectURL(url);
            console.error("Erro ao carregar SVG no objeto Image (V2):", e);
            reject(new Error("Falha ao carregar SVG como imagem (V2): " + e.message));
        }
        img.src = url;
    });
}

let CACHED_ICONS_PNG_V2 = {};

async function preloadAndCacheIconsV2(iconColor = '#444444') { 
    if (Object.keys(CACHED_ICONS_PNG_V2).length > 0 && CACHED_ICONS_PNG_V2._color === iconColor) {
        return; 
    }
    try {
        CACHED_ICONS_PNG_V2.key = await svgToPngDataURLV2(ICONS_SVG_STRINGS_V2.key, 24, 24, iconColor);
        CACHED_ICONS_PNG_V2.clock = await svgToPngDataURLV2(ICONS_SVG_STRINGS_V2.clock, 24, 24, iconColor);
        CACHED_ICONS_PNG_V2.wifi = await svgToPngDataURLV2(ICONS_SVG_STRINGS_V2.wifi, 24, 24, iconColor);
        CACHED_ICONS_PNG_V2._color = iconColor;
    } catch (error) {
        console.error("Falha ao pré-carregar um ou mais ícones (V2):", error);
        CACHED_ICONS_PNG_V2 = {}; 
    }
}

async function drawSingleVoucherLayout2(doc, xVoucher, yVoucher, voucherWidth, voucherHeight, voucherInfo, logoDetails, icons) {
    const internalPadding = 1.5; 
    
    doc.setDrawColor(150, 150, 150); 
    doc.setLineDashPattern([0.7, 0.7], 0); 
    doc.rect(xVoucher, yVoucher, voucherWidth, voucherHeight); 
    doc.setLineDashPattern([], 0); 

    const logoMaxUserDefinedHeight = voucherHeight * 0.45; 
    const logoDesiredTopMargin = 1.0; 

    let yOffsetForContentBelowLogo = yVoucher + internalPadding + logoMaxUserDefinedHeight + internalPadding; 

    if (logoDetails && logoDetails.dataUrl) {
        const logoOriginalWidth = logoDetails.width;   
        const logoOriginalHeight = logoDetails.height; 
        const aspectRatio = logoOriginalWidth / logoOriginalHeight;
        
        let drawnLogoHeight = logoMaxUserDefinedHeight; 
        let drawnLogoWidth = drawnLogoHeight * aspectRatio;

        if (drawnLogoWidth > voucherWidth - (internalPadding * 2)) {
            drawnLogoWidth = voucherWidth - (internalPadding * 2);
            drawnLogoHeight = drawnLogoWidth / aspectRatio;
        }
        if (drawnLogoHeight > logoMaxUserDefinedHeight) {
            drawnLogoHeight = logoMaxUserDefinedHeight;
            drawnLogoWidth = drawnLogoHeight * aspectRatio;
        }
        
        const logoDrawX = xVoucher + (voucherWidth - drawnLogoWidth) / 2; 
        const logoDrawY = yVoucher + logoDesiredTopMargin; 

        try {
            doc.addImage(
                logoDetails.dataUrl,
                logoDetails.fileType || 'PNG',
                logoDrawX, 
                logoDrawY, 
                drawnLogoWidth,  
                drawnLogoHeight
            );
        } catch (e) { console.error("Erro ao adicionar logo (Layout 2):", e); }
        
        yOffsetForContentBelowLogo = logoDrawY + drawnLogoHeight + internalPadding; 
    }
    
    let currentTextY = yOffsetForContentBelowLogo + 1.5; 

    const iconSize = 3.7; 
    const textYAlignOffset = iconSize / 2 + 0.2; 
    const textLeftMarginFromIcon = 1.5; 
    const contentStartX = xVoucher + internalPadding + 2; 
    const contentMaxWidth = voucherWidth - (internalPadding * 2) - iconSize - textLeftMarginFromIcon - 2; 
    const textLineVerticalSpacing = 4.5; 

    const remainingHeightForText = (yVoucher + voucherHeight - internalPadding) - currentTextY;
    const requiredHeightForText = (textLineVerticalSpacing * 2) + iconSize; 
    if (remainingHeightForText > requiredHeightForText + 1) { 
        currentTextY = currentTextY + (remainingHeightForText - requiredHeightForText) / 2;
    }

    const ssidFontSize = 8.5; 
    doc.setFontSize(ssidFontSize);
    if (CACHED_ICONS_PNG_V2.wifi) {
        try { doc.addImage(CACHED_ICONS_PNG_V2.wifi, 'PNG', contentStartX, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de wifi não adicionado (Layout 2):", e); }
    }
    doc.setFont('helvetica', 'normal'); 
    doc.setTextColor(60, 60, 60); 
    const ssidTextX = CACHED_ICONS_PNG_V2.wifi ? contentStartX + iconSize + textLeftMarginFromIcon : contentStartX;
    doc.text(voucherInfo.ssid || "Nome da Rede", ssidTextX, currentTextY, { maxWidth: contentMaxWidth, baseline: 'middle' });
    currentTextY += textLineVerticalSpacing; 

    const codeFontSize = 11; 
    doc.setFontSize(codeFontSize);
    if (CACHED_ICONS_PNG_V2.key) {
        try { doc.addImage(CACHED_ICONS_PNG_V2.key, 'PNG', contentStartX, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de chave não adicionado (Layout 2):", e); }
    }
    doc.setFont('helvetica', 'bold'); 
    doc.setTextColor(0, 0, 0); 
    const codeTextX = CACHED_ICONS_PNG_V2.key ? contentStartX + iconSize + textLeftMarginFromIcon : contentStartX;
    doc.text(voucherInfo.code || "SEM-CODIGO", codeTextX, currentTextY, { maxWidth: contentMaxWidth, baseline: 'middle' });
    currentTextY += textLineVerticalSpacing; 

    doc.setFontSize(ssidFontSize); 
    if (CACHED_ICONS_PNG_V2.clock) {
        try { doc.addImage(CACHED_ICONS_PNG_V2.clock, 'PNG', contentStartX, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de relógio não adicionado (Layout 2):", e); }
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60); 
    const durationTextX = CACHED_ICONS_PNG_V2.clock ? contentStartX + iconSize + textLeftMarginFromIcon : contentStartX;
    doc.text(voucherInfo.duration || "Validade", durationTextX, currentTextY, { maxWidth: contentMaxWidth, baseline: 'middle' });
}

// Função para adicionar rodapé (pode ser a mesma do genpdf_1.js ou específica)
function addFooterToPage_Layout2(doc) { // Renomeada para clareza, mas a lógica pode ser idêntica
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerText = `VoucherFi.rouglas.com`;
    const footerTextY = pageHeight - 5; // 5mm da borda inferior
    
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100); 
    doc.text(footerText, pageWidth / 2, footerTextY, { align: 'center' });
}


async function gerarFolhaDeVouchersPDF_Layout2(listaDeCodigos, dadosComuns, idElementoLogo = 'voucher-logo') {
    if (typeof jspdf === 'undefined' || typeof jspdf.jsPDF === 'undefined') {
        alert('Biblioteca jsPDF não está carregada.');
        throw new Error('jsPDF não carregada.');
    }
    if (!listaDeCodigos || listaDeCodigos.length === 0) {
        alert('Nenhum código de voucher fornecido.');
        return; 
    }

    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const paginaMargem = 5; 
    const larguraPaginaUtil = doc.internal.pageSize.getWidth() - (2 * paginaMargem);
    const alturaUtilParaVouchers = doc.internal.pageSize.getHeight() - (2 * paginaMargem) - 10; // Reserva 10mm para o rodapé

    const alturaVoucherIndividual = 40;   
    const larguraVoucherIndividual = 60;  
    const espacoEntreVouchersHorizontal = 0; 
    const espacoEntreVouchersVertical = 0;   
    const vouchersPorLinha = 3; 

    const vouchersPorColuna = Math.floor((alturaUtilParaVouchers + espacoEntreVouchersVertical) / (alturaVoucherIndividual + espacoEntreVouchersVertical)); 
    const totalVouchersPorPagina = vouchersPorLinha * vouchersPorColuna;
    
    const larguraTotalGrade = vouchersPorLinha * larguraVoucherIndividual + (vouchersPorLinha - 1) * espacoEntreVouchersHorizontal;
    const alturaTotalGrade = vouchersPorColuna * alturaVoucherIndividual + (vouchersPorColuna - 1) * espacoEntreVouchersVertical;
    
    const xInicialGrade = paginaMargem + (larguraPaginaUtil - larguraTotalGrade) / 2;
    const yInicialGrade = paginaMargem + (alturaUtilParaVouchers - alturaTotalGrade) / 2; // Centraliza na altura útil

    const elementoLogo = document.getElementById(idElementoLogo);
    let detalhesLogo = null;
    if (elementoLogo && elementoLogo.src && elementoLogo.src !== window.location.href && !elementoLogo.src.endsWith('#')) {
        try {
            const tempImg = new Image();
            await new Promise((resolve, reject) => { 
                tempImg.onload = () => {
                    detalhesLogo = {
                        dataUrl: elementoLogo.src, 
                        width: tempImg.naturalWidth,  
                        height: tempImg.naturalHeight, 
                        fileType: elementoLogo.src.includes('image/png') ? 'PNG' : (elementoLogo.src.includes('image/jpeg') ? 'JPEG' : 'UNKNOWN')
                    };
                    resolve();
                };
                tempImg.onerror = (e) => {
                    console.error("Erro ao carregar imagem do logo para obter dimensões (Layout 2):", e);
                    reject(e); 
                };
                tempImg.src = elementoLogo.src; 
            });
        } catch (e) { 
            console.warn("Não foi possível processar o logo (Layout 2):", e);
            detalhesLogo = null; 
        }
    }

    await preloadAndCacheIconsV2(); 

    let contadorVouchersNaPagina = 0;
    
    addFooterToPage_Layout2(doc); // Adiciona rodapé à primeira página

    for (let i = 0; i < listaDeCodigos.length; i++) {
        if (contadorVouchersNaPagina > 0 && contadorVouchersNaPagina >= totalVouchersPorPagina) {
            doc.addPage();
            addFooterToPage_Layout2(doc); // Adiciona rodapé à nova página
            contadorVouchersNaPagina = 0;
        }

        const linhaAtual = Math.floor(contadorVouchersNaPagina / vouchersPorLinha);
        const colunaAtual = contadorVouchersNaPagina % vouchersPorLinha;
        const xVoucher = xInicialGrade + colunaAtual * (larguraVoucherIndividual + espacoEntreVouchersHorizontal);
        const yVoucher = yInicialGrade + linhaAtual * (alturaVoucherIndividual + espacoEntreVouchersVertical);
        const dadosDoVoucherAtual = {
            code: listaDeCodigos[i],
            ssid: dadosComuns.ssid,
            duration: dadosComuns.duration
        };
        
        await drawSingleVoucherLayout2(doc, xVoucher, yVoucher, larguraVoucherIndividual, alturaVoucherIndividual, dadosDoVoucherAtual, detalhesLogo, CACHED_ICONS_PNG_V2);
        contadorVouchersNaPagina++;
    }

    const nomeArquivo = `VoucherFI_L2_${(dadosComuns.ssid || 'Vouchers').replace(/[^a-z0-9_.-]/gi, '_')}.pdf`;
    doc.save(nomeArquivo);
}

if (!window.voucherGenerator) {
    window.voucherGenerator = {};
}
window.voucherGenerator.gerarFolhaDeVouchersPDF_Layout2 = gerarFolhaDeVouchersPDF_Layout2;

console.log("genpdf_2.js carregado e funções de layout adicionadas a window.voucherGenerator:", window.voucherGenerator);