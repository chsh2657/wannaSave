// 🔌 Google Gemini API 관리

const APIManager = {
    // 기본 무료 API 키 (공개 사용)
    // 프로덕션에서는 백엔드에서 관리해야 함
    FREE_API_KEY: 'AIzaSyC6x_A-2S6K8b5X1z_V1w-m8_N0K2f3G4h',
    
    // Google Gemini API 엔드포인트
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

    /**
     * 이미지에서 텍스트 추출 및 분석
     */
    async analyzeReceipt(imageData) {
        try {
            // API 사용량 체크
            const config = StorageManager.getApiConfig();
            const usage = StorageManager.getApiUsage();
            const limit = config.isCustom ? config.usageLimit : 50;

            if (usage >= limit) {
                showToast('API 사용 한도에 도달했습니다. 다음 달에 다시 시도해주세요.', 'warning');
                throw new Error('API 사용 한도 초과');
            }

            // 사용할 API 키 결정
            const apiKey = config.isCustom && config.customKey ? config.customKey : this.FREE_API_KEY;

            const response = await this.callGeminiAPI(imageData, apiKey);
            
            // API 사용량 기록
            StorageManager.recordApiUsage();

            return this.parseGeminiResponse(response);
        } catch (error) {
            console.error('API 호출 실패:', error);
            throw error;
        }
    },

    /**
     * Google Gemini API 호출
     */
    async callGeminiAPI(imageData, apiKey) {
        const base64Image = imageData.split(',')[1];

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: `이 이미지는 영수증이나 지출 내역입니다. 다음 정보를 추출해주세요:
1. 금액 (숫자만)
2. 상품/서비스 이름
3. 카테고리 (식비, 교통, 쇼핑, 의료, 교육, 기타 중 선택)
4. 가능하면 날짜

JSON 형식으로 응답해주세요:
{
  "amount": 숫자,
  "description": "설명",
  "category": "카테고리",
  "date": "YYYY-MM-DD",
  "confidence": 0.0~1.0 사이의 신뢰도
}

만약 영수증 이미지가 아니거나 금액을 찾을 수 없으면 null을 반환해주세요.`
                        },
                        {
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: base64Image
                            }
                        }
                    ]
                }
            ]
        };

        const response = await fetch(`${this.API_ENDPOINT}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API 오류:', errorData);
            throw new Error(`API 오류: ${response.status}`);
        }

        return await response.json();
    },

    /**
     * Gemini API 응답 파싱
     */
    parseGeminiResponse(response) {
        try {
            if (!response.candidates || !response.candidates[0]) {
                throw new Error('유효한 응답 없음');
            }

            const content = response.candidates[0].content.parts[0].text;
            
            // JSON 추출
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('JSON 형식의 응답 없음');
            }

            const data = JSON.parse(jsonMatch[0]);

            return {
                amount: data.amount || 0,
                description: data.description || '',
                category: data.category || '기타',
                date: data.date || new Date().toISOString().split('T')[0],
                confidence: data.confidence || 0.5,
                raw: content
            };
        } catch (error) {
            console.error('응답 파싱 실패:', error);
            return {
                amount: 0,
                description: '분석 실패',
                category: '기타',
                date: new Date().toISOString().split('T')[0],
                confidence: 0
            };
        }
    },

    /**
     * 커스텀 API 키 검증
     */
    async validateApiKey(apiKey) {
        try {
            // 간단한 검증 요청
            const response = await fetch(
                `${this.API_ENDPOINT}?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: 'test'
                                    }
                                ]
                            }
                        ]
                    })
                }
            );

            return response.ok;
        } catch (error) {
            return false;
        }
    },

    /**
     * API 상태 확인
     */
    getApiStatus() {
        const config = StorageManager.getApiConfig();
        const usage = StorageManager.getApiUsage();
        const limit = config.isCustom ? config.usageLimit : 50;

        return {
            isConfigured: config.isCustom && config.customKey !== '',
            usage: usage,
            limit: limit,
            remaining: Math.max(0, limit - usage),
            percentUsed: Math.round((usage / limit) * 100)
        };
    }
};
