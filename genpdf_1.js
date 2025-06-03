// genpdf_1.js (Layout com logo à esquerda, 4 colunas - COM RODAPÉ ADICIONADO)

const ICONS_SVG_STRINGS_L1 = { // Adicionado _L1
    key: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="8" cy="15" r="4"></circle><line x1="10.85" y1="12.15" x2="19" y2="4"></line><line x1="18" y1="5" x2="20" y2="7"></line><line x1="15" y1="8" x2="17" y2="10"></line></svg>`,
    clock: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><circle cx="12" cy="12" r="9"></circle><polyline points="12 7 12 12 15 15"></polyline></svg>`,
    wifi: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><line x1="12" y1="18" x2="12.01" y2="18"></line><path d="M9.172 15.172a4 4 0 0 1 5.656 0"></path><path d="M6.343 12.343a8 8 0 0 1 11.314 0"></path><path d="M3.515 9.515c4.686 -4.687 12.284 -4.687 16.97 0"></path></svg>`
};

async function svgToPngDataURL_L1(svgString, width = 32, height = 32, fillColor = 'black') { // Adicionado _L1
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
                console.error("Erro ao converter canvas para DataURL (L1):", e);
                reject(new Error("Falha ao converter SVG para PNG Data URL (L1): " + e.message));
            }
        };
        img.onerror = function (e) {
            URL.revokeObjectURL(url);
            console.error("Erro ao carregar SVG no objeto Image (L1):", e);
            reject(new Error("Falha ao carregar SVG como imagem (L1): " + e.message));
        }
        img.src = url;
    });
}

let CACHED_ICONS_PNG_L1 = {}; // Adicionado _L1

async function preloadAndCacheIcons_L1(iconColor = '#555555') { // Adicionado _L1
    if (Object.keys(CACHED_ICONS_PNG_L1).length > 0 && CACHED_ICONS_PNG_L1._color === iconColor) {
        return; 
    }
    try {
        CACHED_ICONS_PNG_L1.key = await svgToPngDataURL_L1(ICONS_SVG_STRINGS_L1.key, 24, 24, iconColor);
        CACHED_ICONS_PNG_L1.clock = await svgToPngDataURL_L1(ICONS_SVG_STRINGS_L1.clock, 24, 24, iconColor);
        CACHED_ICONS_PNG_L1.wifi = await svgToPngDataURL_L1(ICONS_SVG_STRINGS_L1.wifi, 24, 24, iconColor);
        CACHED_ICONS_PNG_L1._color = iconColor;
    } catch (error) {
        console.error("Falha ao pré-carregar um ou mais ícones (L1):", error);
        CACHED_ICONS_PNG_L1 = {}; 
    }
}

// Função principal que desenha um voucher individual na folha
async function drawSingleVoucherOnSheet_L1(doc, xVoucher, yVoucher, voucherWidth, voucherHeight, voucherInfo, logoDetails, icons) { // Adicionado _L1
    const internalPadding = 1.5; 
    const logoAreaNominalWidth = 10; 
    
    const contentAreaX = xVoucher + logoAreaNominalWidth;
    const contentAreaWidth = voucherWidth - logoAreaNominalWidth - internalPadding; 
    
    const iconSize = 2.8; 
    const textLineHeightSpace = 4.2; 
    const totalContentBlockHeight = (textLineHeightSpace * 3) - internalPadding; 
    let currentTextY = yVoucher + (voucherHeight - totalContentBlockHeight) / 2 + (textLineHeightSpace / 2); 
    
    doc.setDrawColor(100, 100, 100); 
    doc.setLineDashPattern([0.7, 0.7], 0); 
    doc.rect(xVoucher, yVoucher, voucherWidth, voucherHeight); 
    doc.setLineDashPattern([], 0); 

    if (logoDetails && logoDetails.dataUrl) {
        const logoScaleBoost = 1.4; 
        const logoOriginalWidth = logoDetails.width;
        const logoOriginalHeight = logoDetails.height;
        let visualWidthInLogoArea = logoOriginalHeight; 
        let visualHeightInLogoArea = logoOriginalWidth;
        const maxVisualWidth = logoAreaNominalWidth - (internalPadding * 2);
        const maxVisualHeight = voucherHeight - (internalPadding * 2);
        let scale = 1;
        if (visualWidthInLogoArea > maxVisualWidth) {
            scale = maxVisualWidth / visualWidthInLogoArea;
        }
        if (visualHeightInLogoArea * scale > maxVisualHeight) {
            scale *= maxVisualHeight / (visualHeightInLogoArea * scale);
        }
        scale *= logoScaleBoost;
        const scaledOriginalWidth = logoOriginalWidth * scale;
        const scaledOriginalHeight = logoOriginalHeight * scale;
        const logoOffsetX = 8.5; 
        const finalDrawX = xVoucher + internalPadding + logoOffsetX; 
        const logoAreaHeight = voucherHeight - 2 * internalPadding;
        const offsetY_calc = (logoAreaHeight - scaledOriginalWidth) / 2; 
        const logoYOffset_custom = 3; 
        const finalDrawY = yVoucher + internalPadding + offsetY_calc + logoYOffset_custom; 

        try {
            doc.addImage(
                logoDetails.dataUrl,
                logoDetails.fileType || 'PNG',
                finalDrawX,
                finalDrawY, 
                scaledOriginalWidth,  
                scaledOriginalHeight, 
                null, 'NONE', 90 
            );
        } catch (e) { console.error("Erro ao adicionar logo rotacionado (L1):", e); }
    }
    
    const textYAlignOffset = iconSize / 2 + 0.1; 
    const textLeftMarginFromIcon = 1.5; 
    const actualContentXStart = contentAreaX + internalPadding / 2; 

    const ssidFontSize = 7;
    doc.setFontSize(ssidFontSize);
    if (icons.wifi) { 
        try { doc.addImage(icons.wifi, 'PNG', actualContentXStart, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de wifi não adicionado (L1):", e); }
    }
    doc.setFont('helvetica', 'normal'); 
    doc.setTextColor(60, 60, 60); 
    const ssidTextX = icons.wifi ? actualContentXStart + iconSize + textLeftMarginFromIcon : actualContentXStart;
    doc.text(voucherInfo.ssid || "Nome da Rede", ssidTextX, currentTextY, { maxWidth: contentAreaWidth - (icons.wifi ? iconSize + textLeftMarginFromIcon : 0) - internalPadding, baseline: 'middle' });
    currentTextY += textLineHeightSpace; 

    if (icons.key) { 
        try { doc.addImage(icons.key, 'PNG', actualContentXStart, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de chave não adicionado (L1):", e); }
    }
    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(9.5); 
    doc.setTextColor(0, 0, 0); 
    const codeTextX = icons.key ? actualContentXStart + iconSize + textLeftMarginFromIcon : actualContentXStart;
    doc.text(voucherInfo.code || "SEM-CODIGO", codeTextX, currentTextY, { maxWidth: contentAreaWidth - (icons.key ? iconSize + textLeftMarginFromIcon : 0) - internalPadding, baseline: 'middle' });
    currentTextY += textLineHeightSpace; 

    doc.setFontSize(ssidFontSize); 
    if (icons.clock) { 
        try { doc.addImage(icons.clock, 'PNG', actualContentXStart, currentTextY - textYAlignOffset, iconSize, iconSize); }
        catch(e){ console.warn("Ícone de relógio não adicionado (L1):", e); }
    }
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60); 
    const durationTextX = icons.clock ? actualContentXStart + iconSize + textLeftMarginFromIcon : actualContentXStart;
    doc.text(voucherInfo.duration || "Validade", durationTextX, currentTextY, { maxWidth: contentAreaWidth - (icons.clock ? iconSize + textLeftMarginFromIcon : 0) - internalPadding, baseline: 'middle' });
}

// Função para adicionar rodapé
function addFooterToPage(doc, pageNumber, totalPages) {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const footerText = `VoucherFi.rouglas.com`; //  Página ${pageNumber}/${totalPages} (opcional)
    const footerTextY = pageHeight - 5; // 5mm da borda inferior
    
    doc.setFontSize(7); // Tamanho pequeno para o rodapé
    doc.setTextColor(100, 100, 100); // Cor cinza para o rodapé
    doc.text(footerText, pageWidth / 2, footerTextY, { align: 'center' });
}


async function gerarFolhaDeVouchersPDF_Layout1(listaDeCodigos, dadosComuns, idElementoLogo = 'voucher-logo') { 
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
    const alturaPaginaUtil = doc.internal.pageSize.getHeight() - (2 * paginaMargem) - 10; // -10mm para espaço do rodapé

    const alturaVoucherIndividual = 20;  
    const espacoEntreVouchersHorizontal = 0; 
    const espacoEntreVouchersVertical = 0;   
    const vouchersPorLinha = 4; 

    const larguraVoucherIndividual = parseFloat(((larguraPaginaUtil - ( (vouchersPorLinha - 1) * espacoEntreVouchersHorizontal) ) / vouchersPorLinha).toFixed(2));

    const vouchersPorColuna = Math.floor((alturaPaginaUtil + espacoEntreVouchersVertical) / (alturaVoucherIndividual + espacoEntreVouchersVertical));
    const totalVouchersPorPagina = vouchersPorLinha * vouchersPorColuna;
    
    const xInicialGrade = paginaMargem;
    const yInicialGrade = paginaMargem;

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
                    console.error("Erro ao carregar imagem do logo para obter dimensões (L1):", e);
                    reject(e); 
                };
                tempImg.src = elementoLogo.src; 
            });
        } catch (e) { 
            console.warn("Não foi possível processar o logo (L1):", e);
            detalhesLogo = null; 
        }
    }

    await preloadAndCacheIcons_L1(); 

    let contadorVouchersNaPagina = 0;
    let numeroPaginaAtual = 1;
    const totalPaginasEstimado = Math.ceil(listaDeCodigos.length / totalVouchersPorPagina);

    addFooterToPage(doc, numeroPaginaAtual, totalPaginasEstimado); // Adiciona rodapé à primeira página

    for (let i = 0; i < listaDeCodigos.length; i++) {
        if (contadorVouchersNaPagina > 0 && contadorVouchersNaPagina >= totalVouchersPorPagina) {
            doc.addPage();
            numeroPaginaAtual++;
            addFooterToPage(doc, numeroPaginaAtual, totalPaginasEstimado); // Adiciona rodapé à nova página
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
        
        await drawSingleVoucherOnSheet_L1(doc, xVoucher, yVoucher, larguraVoucherIndividual, alturaVoucherIndividual, dadosDoVoucherAtual, detalhesLogo, CACHED_ICONS_PNG_L1);
        contadorVouchersNaPagina++;
    }

    const nomeArquivo = `VoucherFI_L1_${(dadosComuns.ssid || 'Vouchers').replace(/[^a-z0-9_.-]/gi, '_')}.pdf`;
    doc.save(nomeArquivo);
}

if (!window.voucherGenerator) {
    window.voucherGenerator = {};
}
window.voucherGenerator.gerarFolhaDeVouchersPDF_Layout1 = gerarFolhaDeVouchersPDF_Layout1; 

console.log("genpdf_1.js carregado e função Layout1 adicionada a window.voucherGenerator:", window.voucherGenerator);