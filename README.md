# 💰 가계부 - 스마트 지출 관리 웹앱

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Status](https://img.shields.io/badge/status-Active-brightgreen.svg)

> Google Gemini AI를 활용한 스마트 가계부 웹앱
> 📷 카메라로 영수증 인식 | 📊 자동 통계 분석 | 🔐 API 설정 자유 | 💳 무료 & 저가 운영

## 🌟 주요 기능

### 1️⃣ **스마트 대시보드**
- 월별 수입/지출 한눈에 파악
- 카테고리별 지출 분석
- 실시간 수지 현황

### 2️⃣ **카메라 인식 (AI 영수증 분석)**
- 📸 카메라로 영수증 촬영
- 🤖 Google Gemini AI가 자동 분석
- 💬 금액, 상품명, 카테고리 자동 추출
- ✏️ 분석 결과 수정 가능

### 3️⃣ **유연한 API 설정**
- **기본 무료 API**: 월 50회 요청 무료 제공
- **커스텀 API**: 자신의 Google API 키 등록 가능
- **비용 최소화**: 무료 tier만으로도 충분

### 4️⃣ **다양한 입력 방식**
- 📱 카메라 촬영으로 자동 인식
- ✍️ 수동으로 직접 입력
- 📤 JSON 데이터 가져오기/내보내기

### 5️⃣ **로컬 저장소**
- 🔒 모든 데이터가 브라우저에 저장 (개인정보 보호)
- 📤 JSON 백업 & 복구
- 🗑️ 쉬운 데이터 관리

## 🚀 빠른 시작

### 온라인 접속 (GitHub Pages)
```
https://chsh2657.github.io/wannaSave
```

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/chsh2657/wannaSave.git
cd wannaSave

# 로컬 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js http-server
npx http-server
```

그 후 브라우저에서 `http://localhost:8000` 열기

## 📋 사용 방법

### 1. **카메라로 지출 등록**
1. "📷 카메라 등록" 탭으로 이동
2. "📸 사진 촬영" 버튼으로 영수증 촬영
3. "🔍 AI 분석" 버튼으로 자동 분석
4. 필요시 수정 후 "저장" 클릭

### 2. **수동으로 입력**
1. "✏️ 수동 입력" 탭으로 이동
2. 날짜, 유형(수입/지출), 카테고리, 금액 입력
3. "📝 저장" 클릭

### 3. **API 설정** (선택사항)
1. "⚙️ API 설정" 탭으로 이동
2. 다음 중 선택:
   - **기본 무료 API 사용** (권장): 추가 설정 없음
   - **커스텀 API 설정**: Google API 키 입력 (선택)

## 🔑 API 설정 가이드

### 기본 무료 API (추천)
- **월 50회** 무료 사용 가능
- 추가 설정 필요 없음
- 비용 **0원**

### 커스텀 Google Gemini API

#### API 키 발급 방법:
1. [Google AI Studio](https://ai.google.dev/) 방문
2. "API 키 생성" 클릭
3. 새 프로젝트 생성
4. API 키 복사
5. 앱에서 "⚙️ API 설정" → "커스텀 API 설정" → 키 입력
6. "💾 API 키 저장" 클릭

#### Google Gemini API 가격:
- **무료 tier**: 월 1,500 요청 무료
- **유료**: 100만 토큰당 $0.075

**💡 팁**: 기본 무료 API로 시작하고, 필요에 따라 커스텀 API를 추가하세요!

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI/ML**: Google Gemini Vision API
- **Storage**: Browser LocalStorage
- **Deployment**: GitHub Pages
- **No Backend Required** ✅

## 📊 카테고리

- 🍜 **식비**: 음식 관련 지출
- 🚌 **교통**: 버스, 택시, 주차비
- 🛍️ **쇼핑**: 의류, 용품, 전자제품
- 🏥 **의료**: 약국, 병원 비용
- 📚 **교육**: 학원, 책, 강좌
- 💰 **월급**: 월급 수입
- 🎁 **보너스**: 상여금, 기타 수입
- 📌 **기타**: 분류되지 않은 항목

## 💾 데이터 관리

### 백업 방법
1. "⚙️ API 설정" 탭으로 이동
2. "📥 데이터 내보내기 (JSON)" 클릭
3. JSON 파일 자동 다운로드

### 복구 방법
1. "⚙️ API 설정" 탭으로 이동
2. "📤 데이터 가져오기" 클릭
3. 백업된 JSON 파일 선택
4. 데이터 자동 복구

## 🔒 보안 & 개인정보

- ✅ **완전 로컬 저장**: 모든 데이터가 브라우저에만 저장
- ✅ **서버 저장 없음**: 개인정보 유출 위험 없음
- ✅ **HTTPS**: GitHub Pages 자동 암호화
- ✅ **오픈소스**: 코드 투명성

## 📱 지원 기기

- ✅ 데스크톱 (Chrome, Firefox, Safari, Edge)
- ✅ 태블릿 (iPad, Android 태블릿)
- ✅ 스마트폰 (iOS, Android) - 카메라 기능 지원

## 🎯 로드맵

- [x] 기본 가계부 기능
- [x] 카메라 영수증 인식
- [x] API 설정 페이지
- [x] 데이터 백업/복구
- [ ] 월별 예산 설정
- [ ] 지출 트렌드 차트
- [ ] 반복 거래 자동화
- [ ] 클라우드 동기화
- [ ] 다중 사용자 지원

## 🐛 버그 리포트 & 피드백

문제가 있거나 기능을 제안하고 싶으신가요?
[GitHub Issues](https://github.com/chsh2657/wannaSave/issues) 에서 제보해주세요!

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 👨‍💻 개발자

**chsh2657** - 초기 개발
- GitHub: [@chsh2657](https://github.com/chsh2657)

## 🙏 감사의 말

- Google Gemini Vision API
- GitHub Pages 무료 호스팅
- 오픈소스 커뮤니티

---

**⭐ 도움이 되셨다면 스타를 눌러주세요!**
