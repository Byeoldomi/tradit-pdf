/**
 * Antigravity API 클라이언트 목업 (번역)
 * 실제 환경 연동 시 이 부분을 Antigravity REST API 호출로 대체합니다.
 */

export interface TranslationResult {
    originalText: string;
    translatedText: string;
}

/**
 * 텍스트 배열을 받아 일괄 번역을 수행합니다.
 * @param texts 원문 텍스트 배열
 * @param targetLang 목표 언어 코드 (기본: ko)
 * @returns 번역된 텍스트 배열
 */
export const translateBatch = async (
    texts: string[],
    targetLang: string = "ko"
): Promise<TranslationResult[]> => {
    const results: TranslationResult[] = [];

    // Process translations in chunks to avoid rate limiting
    for (const text of texts) {
        if (!text.trim() || /^[\d.,\s]+$/.test(text) || text.length < 2) {
            results.push({ originalText: text, translatedText: text });
            continue;
        }

        try {
            // Encode the text properly
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
            const response = await fetch(url);

            if (!response.ok) {
                // If API fails, fall back to original
                results.push({ originalText: text, translatedText: text });
                continue;
            }

            const data = await response.json();

            // Extract translated text from the weird GTx JSON response structure
            let translatedText = "";
            if (data && data[0]) {
                data[0].forEach((item: any) => {
                    if (item[0]) translatedText += item[0];
                });
            }

            results.push({
                originalText: text,
                translatedText: translatedText || text
            });

            // Small delay to prevent API blocking
            await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
            console.error("Translation error for:", text, error);
            results.push({ originalText: text, translatedText: text });
        }
    }

    return results;
};
