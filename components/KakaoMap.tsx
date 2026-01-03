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

  useEffect(() => {
    // 카카오맵 API 로드 확인
    const checkKakaoLoaded = () => {
      if (window.kakao && window.kakao.maps) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // 즉시 확인
    if (checkKakaoLoaded()) {
      return;
    }

    // 주기적으로 확인 (최대 5초)
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      if (checkKakaoLoaded() || attempts >= maxAttempts) {
        clearInterval(interval);
        if (attempts >= maxAttempts) {
          console.error('Kakao Maps API 로드 실패');
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
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
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
      {!isLoaded && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#fff',
        }}>
          지도 로딩 중...
        </div>
      )}
    </div>
  );
};

export default KakaoMap;
