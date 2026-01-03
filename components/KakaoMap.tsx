import React, { useEffect, useRef, useState } from 'react';

interface KakaoMapProps {
  query: string;
}

declare global {
  interface Window {
    kakao: any;
    kakaoMapLoaded?: boolean;
  }
}

const KakaoMap: React.FC<KakaoMapProps> = ({ query }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const psRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 카카오맵 API 로드 확인 함수
    const checkKakaoLoaded = () => {
      try {
        if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
          console.log('카카오맵 API 로드 확인됨');
          setIsLoaded(true);
          setError(null);
          return true;
        }
        return false;
      } catch (e) {
        console.error('카카오맵 API 확인 중 오류:', e);
        return false;
      }
    };

    // 즉시 확인
    if (checkKakaoLoaded()) {
      return;
    }

    // 스크립트 로드 완료 이벤트 확인
    if (window.kakaoMapLoaded) {
      // 약간의 지연 후 다시 확인 (스크립트는 로드되었지만 API가 아직 준비되지 않았을 수 있음)
      setTimeout(() => {
        if (!checkKakaoLoaded()) {
          // 1초 후에도 안 되면 강제로 시도
          setTimeout(() => {
            if (window.kakao && window.kakao.maps) {
              setIsLoaded(true);
            } else {
              setError('카카오맵 API를 로드할 수 없습니다. API 키와 도메인 설정을 확인해주세요.');
            }
          }, 1000);
        }
      }, 100);
      return;
    }

    // 주기적으로 확인 (최대 10초)
    let attempts = 0;
    const maxAttempts = 100;
    const interval = setInterval(() => {
      attempts++;
      if (checkKakaoLoaded() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts && !window.kakao) {
          console.error('Kakao Maps API 로드 실패: 최대 재시도 횟수 초과');
          setError('카카오맵을 로드할 수 없습니다. 네트워크 연결과 API 키를 확인해주세요.');
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.kakao || !window.kakao.maps) {
      return;
    }

    const { kakao } = window;
    const { maps } = kakao;

    // 기본 위치: 세종특별자치시
    const defaultPosition = new maps.LatLng(36.4800, 127.2890);

    // 지도 초기화 (한 번만)
    if (mapContainer.current && !mapRef.current) {
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
          <div style={{ fontSize: '11px', color: '#666', marginTop: '10px' }}>
            카카오 개발자 콘솔에서 API 키와 도메인 설정을 확인해주세요.
          </div>
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
