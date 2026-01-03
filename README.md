<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   ```bash
   npm run dev
   ```

   또는 Vercel CLI를 사용하여 로컬에서 서버리스 함수도 테스트:
   ```bash
   npm install -g vercel
   vercel dev
   ```

## Deploy to Vercel

1. **Vercel CLI를 사용한 배포:**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **GitHub 연동 배포:**
   - GitHub에 프로젝트를 푸시
   - [Vercel Dashboard](https://vercel.com)에서 프로젝트 import
   - 환경 변수 설정:
     - `GEMINI_API_KEY`: Gemini API 키 입력
   - 자동 배포 완료!

3. **환경 변수 설정:**
   - Vercel Dashboard → 프로젝트 → Settings → Environment Variables
   - `GEMINI_API_KEY` 추가 (Production, Preview, Development 모두 선택)

## 보안 개선사항

- ✅ API 키가 서버리스 함수에서만 사용되어 클라이언트에 노출되지 않음
- ✅ CORS 설정으로 안전한 API 호출
