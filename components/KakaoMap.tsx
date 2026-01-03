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

        // 이미 스크립트 태그가 있으면 기다림
        const existingScript = document.querySelector('script[src*="dapi.kakao.com"]');
        if (existingScript) {
          const checkInterval = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);

          setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.kakao) {
              reject(new Error('카카오맵 스크립트 로드 타임아웃'));
            }
          }, 10000);
          return;
        }

        // 새 스크립트 태그 생성
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=becaf5394d406c2bbc502ee6f8dc2e70&libraries=services';
        script.async = true;

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
          console.error('카카오맵 스크립트 로드 실패:', e);
          reject(new Error('카카오맵 스크립트를 로드할 수 없습니다. 네트워크 연결과 API 키를 확인해주세요.'));
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
        }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>지도 로드 실패</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>{error}</div>
          <div style={{ fontSize: '11px', color: '#666', marginTop: '10px', lineHeight: '1.5' }}>
            <div>카카오 개발자 콘솔에서 확인:</div>
            <div>1. API 키가 활성화되어 있는지</div>
            <div>2. 플랫폼 설정에 현재 도메인이 등록되어 있는지</div>
            <div>3. JavaScript 키가 올바른지</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
