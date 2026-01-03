# Vercel 배포 가이드

## 🚀 빠른 배포 (Vercel CLI)

### 1단계: Vercel CLI 설치 및 로그인
```bash
npm install -g vercel
vercel login
```

### 2단계: 프로젝트 배포
```bash
vercel
```

처음 배포 시:
- Set up and deploy? **Y**
- Which scope? (개인 계정 선택)
- Link to existing project? **N**
- What's your project's name? (프로젝트 이름 입력 또는 Enter)
- In which directory is your code located? **./** (Enter)
- Want to override the settings? **N**

### 3단계: 환경 변수 설정
```bash
vercel env add GEMINI_API_KEY
```
- Value: `AIzaSyB-jtGQux56-DmVmQlidy8w5HRzmigcQVU` (또는 실제 API 키)
- Environment: Production, Preview, Development 모두 선택

### 4단계: 프로덕션 배포
```bash
vercel --prod
```

## 🌐 GitHub 연동 배포 (권장)

### 1단계: GitHub에 코드 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2단계: Vercel Dashboard에서 배포
1. [Vercel Dashboard](https://vercel.com) 접속
2. **Add New Project** 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: **Vite**
   - Root Directory: **./**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** 섹션에서:
   - Name: `GEMINI_API_KEY`
   - Value: `AIzaSyB-jtGQux56-DmVmQlidy8w5HRzmigcQVU` (또는 실제 API 키)
   - Environment: Production, Preview, Development 모두 선택
6. **Deploy** 클릭

### 3단계: 자동 배포 확인
- GitHub에 푸시할 때마다 자동으로 배포됩니다
- Pull Request 생성 시 Preview 배포가 자동 생성됩니다

## 🔧 로컬 테스트

서버리스 함수를 포함한 전체 앱을 로컬에서 테스트:

```bash
vercel dev
```

이 명령어는:
- Vite 개발 서버 실행
- 서버리스 함수도 로컬에서 실행
- 환경 변수 자동 로드

## 📝 주요 변경사항

### 보안 개선
- ✅ API 키가 서버리스 함수(`/api/gemini.ts`)에서만 사용
- ✅ 클라이언트 번들에 API 키 포함되지 않음
- ✅ CORS 설정으로 안전한 API 호출

### 파일 구조
```
├── api/
│   └── gemini.ts          # 서버리스 함수 (API 키 보호)
├── services/
│   └── geminiService.ts    # 클라이언트 API 호출
├── vercel.json             # Vercel 설정
└── ...
```

## 🐛 문제 해결

### API 키 오류
- Vercel Dashboard에서 환경 변수가 올바르게 설정되었는지 확인
- 환경 변수 이름이 정확히 `GEMINI_API_KEY`인지 확인

### 빌드 오류
- Node.js 버전 확인 (Vercel은 Node.js 20.x 사용)
- `npm install`이 성공적으로 완료되었는지 확인

### CORS 오류
- `api/gemini.ts`의 CORS 헤더 확인
- 브라우저 콘솔에서 오류 메시지 확인

## 📚 참고 자료
- [Vercel 문서](https://vercel.com/docs)
- [Vercel 서버리스 함수](https://vercel.com/docs/functions)
- [Vite 배포 가이드](https://vitejs.dev/guide/static-deploy.html)
