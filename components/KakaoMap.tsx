import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  query: string;
}

declare global {
  interface Window {
    kakao: any;
  }
}

const KakaoMap: React.FC<KakaoMapProps> = ({ query }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const psRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // 카카오맵 스크립트 동적 로드
    const loadKakaoScript = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 이미 로드되어 있으면 즉시 resolve
        if (window.kakao && window.kakao.maps) {
          resolve();
          return;
        }

        // HTML에서 이미 스크립트가 로드되었는지 확인
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
          console.log('HTML에서 카카오맵 스크립트 발견, 로드 대기 중...');
          let attempts = 0;
          const maxAttempts = 100; // 10초
          const checkInterval = setInterval(() => {
            attempts++;
            if (window.kakao && window.kakao.maps) {
              clearInterval(checkInterval);
              console.log('카카오맵 API 로드 완료 (HTML 스크립트)');
              resolve();
            } else if (attempts >= maxAttempts) {
              clearInterval(checkInterval);
              console.error('카카오맵 API 로드 타임아웃');
              reject(new Error('카카오맵 스크립트는 로드되었지만 API가 초기화되지 않았습니다. API 키와 도메인 설정을 확인해주세요.'));
            }
          }, 100);
          return;
        }

        // 스크립트 URL
        const scriptUrl = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=930bc92bdb16b055fc72e025edccf8ff&libraries=services';
        const currentDomain = window.location.hostname;
        const currentOrigin = window.location.origin;

        console.log('카카오맵 스크립트 로드 시도:', {
          url: scriptUrl,
          domain: currentDomain,
          origin: currentOrigin,
          protocol: window.location.protocol
        });

        // 스크립트 로드 전에 URL 유효성 확인 (디버깅용)
        console.log('카카오맵 스크립트 로드 준비:', {
          scriptUrl,
          currentOrigin,
          registeredDomain: 'https://chatbot-mocha-delta-42.vercel.app',
          match: currentOrigin === 'https://chatbot-mocha-delta-42.vercel.app'
        });

        // 새 스크립트 태그 생성
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptUrl;
        script.async = true;
        // crossOrigin 제거 - 카카오맵은 crossOrigin이 필요 없을 수 있음

        script.onload = () => {
          console.log('카카오맵 스크립트 로드 완료');
          // 스크립트가 로드되어도 API가 준비되기까지 약간의 시간이 필요할 수 있음
          setTimeout(() => {
            if (window.kakao && window.kakao.maps) {
              resolve();
            } else {
              reject(new Error('카카오맵 API가 초기화되지 않았습니다. API 키와 도메인 설정을 확인해주세요.'));
            }
          }, 500);
        };

        script.onerror = (e) => {
          // Network 탭에서 확인할 수 있도록 상세 정보 로깅
          console.error('카카오맵 스크립트 로드 실패 - 상세 정보:', {
            event: e,
            eventType: e.type,
            eventTarget: e.target,
            scriptSrc: (e.target as HTMLScriptElement)?.src,
            url: scriptUrl,
            domain: currentDomain,
            origin: currentOrigin,
            fullUrl: window.location.href,
            userAgent: navigator.userAgent.substring(0, 100)
          });
          
          // Network 탭 확인 안내
          console.error('디버깅 방법:');
          console.error('1. F12 → Network 탭 열기');
          console.error('2. 페이지 새로고침');
          console.error('3. "dapi.kakao.com" 요청 찾기');
          console.error('4. 상태 코드 확인 (403 = 도메인 미등록, 404 = API 키 오류)');
          console.error('5. Response 탭에서 에러 메시지 확인');
          
          const errorMsg = `카카오맵 스크립트를 로드할 수 없습니다.

현재 도메인: ${currentOrigin}
등록된 도메인: https://chatbot-mocha-delta-42.vercel.app
API 키: 930bc92bdb16b055fc72e025edccf8ff

⚠️ 중요 확인사항:
1. Network 탭(F12)에서 dapi.kakao.com 요청의 상태 코드 확인
   - 403: 도메인 미등록 또는 API 키 문제
   - 404: API 키 오류
   - 기타: 네트워크 문제

2. 도메인 등록 확인:
   - 등록된 도메인과 현재 도메인이 정확히 일치해야 함
   - https://chatbot-mocha-delta-42.vercel.app
   - 현재: ${currentOrigin}
   - 일치 여부: ${currentOrigin === 'https://chatbot-mocha-delta-42.vercel.app' ? '✅ 일치' : '❌ 불일치'}

3. 도메인 등록 후 적용 시간:
   - 변경 사항이 즉시 적용되지 않을 수 있음
   - 몇 분 후 다시 시도하거나 브라우저 캐시 삭제

4. API 키 확인:
   - 카카오 개발자 콘솔에서 JavaScript 키가 활성화되어 있는지 확인`;
          reject(new Error(errorMsg));
        };

        document.head.appendChild(script);
      });
    };

    // 카카오맵 API 로드 및 초기화
    const initMap = async () => {
      try {
        await loadKakaoScript();
        
        if (!window.kakao || !window.kakao.maps) {
          throw new Error('카카오맵 API를 사용할 수 없습니다.');
        }

        setIsLoaded(true);
        setError(null);
      } catch (err: any) {
        console.error('카카오맵 초기화 오류:', err);
        setError(err.message || '카카오맵을 로드할 수 없습니다.');
      }
    };

    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      initMap();
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.kakao || !window.kakao.maps || !mapContainer.current) {
      return;
    }

    const { kakao } = window;
    const { maps } = kakao;

    // 기본 위치: 세종특별자치시
    const defaultPosition = new maps.LatLng(36.4800, 127.2890);

    // 지도 초기화 (한 번만)
    if (!mapRef.current) {
      try {
        const options = {
          center: defaultPosition,
          level: 5,
        };

        mapRef.current = new maps.Map(mapContainer.current, options);
        psRef.current = new maps.services.Places();
        console.log('카카오맵 초기화 완료');
        setError(null);
      } catch (error: any) {
        console.error('카카오맵 초기화 실패:', error);
        setError(`지도 초기화 실패: ${error.message || '알 수 없는 오류'}`);
      }
    }

    // 장소 검색 함수
    const searchPlace = (keyword: string) => {
      if (!psRef.current || !mapRef.current) return;

      psRef.current.keywordSearch(keyword, (data: any[], status: string) => {
        if (status === maps.services.Status.OK && data.length > 0) {
          const place = data[0];
          const position = new maps.LatLng(place.y, place.x);

          if (markerRef.current) {
            markerRef.current.setMap(null);
          }

          markerRef.current = new maps.Marker({
            position: position,
            map: mapRef.current,
          });

          mapRef.current.setCenter(position);
          mapRef.current.setLevel(3);
        } else {
          console.warn('검색 결과 없음:', keyword, status);
          if (mapRef.current) {
            mapRef.current.setCenter(defaultPosition);
            mapRef.current.setLevel(5);
          }
        }
      });
    };

    // 쿼리 처리
    if (query && query.trim() && mapRef.current) {
      searchPlace(query);
    } else if (mapRef.current) {
      mapRef.current.setCenter(defaultPosition);
      mapRef.current.setLevel(5);
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    }
  }, [isLoaded, query]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#1a1a1a',
        position: 'relative',
        zIndex: isLoaded ? 10 : error ? 2 : 1,
      }}
    >
      {!isLoaded && !error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#fff',
          gap: '10px',
        }}>
          <div>지도 로딩 중...</div>
          <div style={{ fontSize: '12px', color: '#888' }}>카카오맵 API를 불러오는 중입니다</div>
        </div>
      )}
      {error && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#ff4444',
          padding: '20px',
          textAlign: 'center',
          gap: '10px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          pointerEvents: 'none',
        }}>
          <div style={{ 
            backgroundColor: 'rgba(0,0,0,0.8)',
            padding: '20px',
            borderRadius: '12px',
            maxWidth: '500px',
            pointerEvents: 'auto',
          }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px' }}>카카오맵 로드 실패</div>
            <div style={{ fontSize: '12px', color: '#aaa', whiteSpace: 'pre-line', marginBottom: '15px' }}>{error}</div>
            <div style={{ 
              fontSize: '11px', 
              color: '#666', 
              lineHeight: '1.5',
              padding: '15px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#fff' }}>해결 방법:</div>
              <div>1. https://developers.kakao.com 접속</div>
              <div>2. 내 애플리케이션 → 앱 설정 → 플랫폼</div>
              <div>3. Web 플랫폼 등록 및 도메인 추가</div>
              <div style={{ marginTop: '8px', fontSize: '10px', color: '#888' }}>
                현재 도메인: {window.location.hostname}
              </div>
              <div style={{ marginTop: '10px', fontSize: '10px', color: '#aaa', fontStyle: 'italic' }}>
                현재는 Google Maps가 표시됩니다.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
