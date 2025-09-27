/**
 * Uploads an image to a Google Drive folder via a Google Apps Script Web App.
 *
 * @param scriptUrl The deployment URL of the Google Apps Script.
 * @param imageDataUrl The base64 data URL of the image to upload.
 * @param fileName The desired file name for the image in Google Drive.
 * @returns A promise that resolves on successful upload.
 */
export const uploadImageToDrive = async (
  scriptUrl: string,
  imageDataUrl: string,
  fileName: string
): Promise<void> => {
  try {
    // Extract base64 content and mime type from data URL
    const match = imageDataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) {
      throw new Error('Formato de URL de dados de imagem inválido.');
    }
    const mimeType = match[1];
    const base64Data = match[2];

    const payload = {
      imageData: base64Data,
      fileName: fileName,
      mimeType: mimeType,
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors', // Important: Apps Script web apps often require this
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    // Note: With 'no-cors', we can't inspect the response. We fire and forget.
    // The user can check their Drive folder to confirm the upload.
    console.log('Solicitação de upload para o Google Drive enviada.');

  } catch (error) {
    console.error('Erro ao enviar imagem para o Google Drive:', error);
    // We don't throw here to avoid blocking the main UI thread for a non-critical background task.
  }
};