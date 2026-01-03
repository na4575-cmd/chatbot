# Vercel 배포 가이드 (웹 대시보드)

## 🚀 빠른 배포 단계

### 1단계: Vercel 대시보드 접속
1. 브라우저에서 [https://vercel.com](https://vercel.com) 접속
2. **Sign Up** 또는 **Log In** (GitHub 계정으로 로그인 권장)

### 2단계: 프로젝트 Import
1. 대시보드에서 **Add New Project** 클릭
2. **Import Git Repository** 선택
3. GitHub 저장소 `na4575-cmd/chatbot` 선택
4. **Import** 클릭

### 3단계: 프로젝트 설정
다음 설정을 확인/수정:

- **Framework Preset**: `Vite` (자동 감지됨)
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: `dist` (자동 설정됨)
- **Install Command**: `npm install` (기본값)

### 4단계: 환경 변수 설정 (중요!)
**Environment Variables** 섹션에서:

1. **Name**: `GEMINI_API_KEY`
2. **Value**: `AIzaSyB-jtGQux56-DmVmQlidy8w5HRzmigcQVU`
3. **Environment**: 
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
   모두 선택

4. **Add** 클릭

### 5단계: 배포 실행
1. **Deploy** 버튼 클릭
2. 배포 진행 상황 확인 (약 1-2분 소요)
3. 배포 완료 후 생성된 URL 확인

## ✅ 배포 완료 후

- 프로덕션 URL: `https://your-project-name.vercel.app`
- 자동 HTTPS 적용
- GitHub에 푸시할 때마다 자동 재배포
- Pull Request 생성 시 Preview 배포 자동 생성

## 🔧 문제 해결

### 빌드 실패 시
- Vercel 대시보드의 **Deployments** 탭에서 로그 확인
- 환경 변수가 올바르게 설정되었는지 확인

### API 오류 발생 시
- 환경 변수 `GEMINI_API_KEY`가 설정되었는지 확인
- 서버리스 함수 로그 확인 (Functions 탭)

## 📝 참고

- 모든 설정은 `vercel.json` 파일에 정의되어 있습니다
- 서버리스 함수는 `/api/gemini.ts`에 있습니다
- API 키는 서버리스 함수에서만 사용되어 안전합니다
