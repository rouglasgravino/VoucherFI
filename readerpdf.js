// readerpdf.js (Simplificado)

async function lerCodigosDoPDF(file) {
    return new Promise((resolve, reject) => {
        if (!file || file.type !== 'application/pdf') {
            reject(new Error('Por favor, selecione um arquivo PDF válido.'));
            return;
        }

        if (typeof pdfjsLib === 'undefined') {
            console.error('Biblioteca PDF.js (pdfjsLib) não está carregada.');
            reject(new Error('Biblioteca PDF.js não carregada. Verifique o HTML.'));
            return;
        }

        // Configuração do workerSrc, essencial para PDF.js
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
        }

        const fileReader = new FileReader();

        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            try {
                const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    
                    // Tentativa de reconstruir o texto de forma mais linear
                    let pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n'; // Adiciona o texto da página
                }
                resolve(extrairApenasOsCodigos(fullText.trim()));
            } catch (error) {
                console.error('Erro ao processar o PDF para extrair códigos:', error);
                reject(new Error('Falha ao ler o PDF. Pode estar corrompido ou em formato inesperado.'));
            }
        };

        fileReader.onerror = function() {
            reject(new Error('Erro ao tentar ler o arquivo PDF.'));
        };

        fileReader.readAsArrayBuffer(file);
    });
}

function extrairApenasOsCodigos(text) {
    // console.log("Texto completo para extração de códigos:\n---\n" + text + "\n---"); // Para depuração
    const codigosEncontrados = [];
    
    // Regex para encontrar códigos no formato XXXXX-XXXXX ou XXXXXXXXXX (sem hífen)
    // \b assegura que estamos pegando palavras/números inteiros.
    const codigoRegex = /\b(\d{5}-\d{5}|\d{10})\b/g;
    let match;

    while ((match = codigoRegex.exec(text)) !== null) {
        // Adiciona o código encontrado se ainda não estiver na lista
        if (!codigosEncontrados.includes(match[1])) {
            codigosEncontrados.push(match[1]);
        }
    }

    if (codigosEncontrados.length > 0) {
        console.log(`Códigos de voucher encontrados no PDF:`, codigosEncontrados);
    } else {
        console.warn("Nenhum código de voucher no formato esperado foi encontrado no texto do PDF.");
    }
    return codigosEncontrados; // Retorna um array de strings (os códigos)
}

// Expor a função principal para ser usada pelo index.html
window.voucherCodeReader = {
    lerCodigosDoPDF,
    extrairCodigosDoTexto: extrairApenasOsCodigos // Para uso com textarea, se desejado
};