// ==========================================
// CÓDIGO GOOGLE APPS SCRIPT (Code.gs)
// ==========================================

const SHEET_NAME = 'Leads';

function initSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Se a folha ainda não existir, cria-a e adiciona os cabeçalhos
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID Único', 'Data/Hora', 'Nome', 'WhatsApp', 'Endereço', 'Status']);
    // Formata o cabeçalho
    sheet.getRange("A1:F1").setFontWeight("bold").setBackground("#f3f4f6");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// 1. Função doPost: Trata pedidos POST vindos do teu JavaScript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || initSheet();
    
    // Converte o texto JSON que vem do fetch
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'create') {
      // Regista uma nova Lead nova (Pendente)
      sheet.appendRow([
        data.id,
        data.timestamp || new Date().toISOString(),
        data.name,
        data.phone,
        data.address,
        data.status
      ]);
      
      return createCORSResponse({ success: true, message: 'Lead criada' });
    } 
    else if (action === 'update') {
      // Atualiza o Status (Reservado VIP ou Rejeitado) usando o ID Único
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let updated = false;

      // Usamos um for loop a começar do índice 1 (para saltar o cabeçalho)
      for (let i = 1; i < values.length; i++) {
        if (values[i][0] == data.id) {
          // O ID está na coluna A (Índice 0). O Status está na coluna F (Índice 5).
          // Mas na notação getRange(linha, a coluna F é 6) e i+1 offset.
          sheet.getRange(i + 1, 6).setValue(data.status);
          updated = true;
          break; // Atualiza apenas o primeiro match e sai do loop
        }
      }
      
      return createCORSResponse({ success: updated, message: updated ? 'Lead atualizada' : 'ID não encontrado' });
    }
    
    return createCORSResponse({ success: false, error: 'Ação Desconhecida' });

  } catch (error) {
    return createCORSResponse({ success: false, error: error.message });
  }
}

// 2. Função doGet: Retorna os dados para o teu Painel de Admin
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || initSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    const leads = [];
    
    // Ignorar o Cabeçalho (inicia no índice 1)
    for (let i = 1; i < values.length; i++) {
      leads.push({
        id: values[i][0],
        timestamp: values[i][1],
        name: values[i][2],
        phone: values[i][3],
        address: values[i][4],
        status: values[i][5]
      });
    }

    // Retorna as leads em formato JSON
    return createCORSResponse({ success: true, leads: leads });
    
  } catch (error) {
    return createCORSResponse({ success: false, error: error.message });
  }
}

// Função utilitária para garantir as respostas em JSON com permissões CORS
function createCORSResponse(jsonObject) {
  return ContentService.createTextOutput(JSON.stringify(jsonObject))
    .setMimeType(ContentService.MimeType.JSON);
}

/*
  ==========================================
  COMO DEPLOYAR ESTE SCRIPT:
  ==========================================
  1. Cria uma App Google Sheet nova: sheets.new
  2. Clica em Extensões > Apps Script.
  3. Apaga todo o código que lá estiver e cola este bloco inteiro de código (Code.gs).
  4. Clica em Guardar (ícone de disquete).
  5. No canto superior direito, clica em "Implementar" > "Nova Implementação".
  6. Seleciona o tipo de implementação: "Aplicação Web" (clica no ícone da engrenagem/ferramenta na esquerda se não aparecer).
  7. Preenche a descrição (ex: "API Leads V1").
  8. Em "Executar como:", escolhe "Eu (o teu email)".
  9. Em "Quem tem acesso:", escolhe "Qualquer pessoa" (MUITO IMPORTANTE).
  10. Clica "Implementar". Aceita e autoriza todas as permissões se a Google pedir (Permitir -> Avançado -> Ir para projeto inseguro).
  11. Copia o URL de Implementação gerado ("https://script.google.com/macros/s/.../exec").
  12. Cola esse mesmo URL na variável GOOGLE_API_URL no teu ficheiro HTML.
*/
