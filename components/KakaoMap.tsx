import React, { useEffect, useRef } from 'react';

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
  const initAttemptRef = useRef(0);

  useEffect(() => {
    // 카카오맵 API 로드 대기 함수
    const waitForKakao = (callback: () => void, maxAttempts = 20) => {
      if (window.kakao && window.kakao.maps) {
        callback();
        return;
      }

      if (initAttemptRef.current >= maxAttempts) {
        console.error('Kakao Maps API 로드 실패: 최대 재시도 횟수 초과');
        return;
      }

      initAttemptRef.current++;
      setTimeout(() => waitForKakao(callback, maxAttempts), 100);
    };

    waitForKakao(() => {
      if (!window.kakao || !window.kakao.maps) {
        console.error('Kakao Maps API가 로드되지 않았습니다.');
        return;
      }

      const { kakao } = window;
      const { maps } = kakao;

      // 기본 위치: 세종특별자치시
      const defaultPosition = new maps.LatLng(36.4800, 127.2890);

      // 지도 초기화
      if (mapContainer.current && !mapRef.current) {
        const options = {
          center: defaultPosition,
          level: 5,
        };

        mapRef.current = new maps.Map(mapContainer.current, options);
        psRef.current = new maps.services.Places();
      }

      // 장소 검색 함수
      const searchPlace = (keyword: string) => {
        if (!psRef.current || !mapRef.current) return;

        psRef.current.keywordSearch(keyword, (data: any[], status: string) => {
          if (status === maps.services.Status.OK) {
            // 첫 번째 검색 결과 사용
            const place = data[0];
            const position = new maps.LatLng(place.y, place.x);

            // 기존 마커 제거
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // 새 마커 생성
            markerRef.current = new maps.Marker({
              position: position,
              map: mapRef.current,
            });

            // 지도 중심 이동
            mapRef.current.setCenter(position);
            mapRef.current.setLevel(3);
          } else if (status === maps.services.Status.ZERO_RESULT) {
            console.warn('검색 결과가 없습니다:', keyword);
            // 검색 결과가 없으면 기본 위치로
            if (mapRef.current) {
              mapRef.current.setCenter(defaultPosition);
              mapRef.current.setLevel(5);
            }
          } else {
            console.error('장소 검색 중 오류 발생:', status);
          }
        });
      };

      // 쿼리가 변경되면 검색
      if (query && query.trim()) {
        searchPlace(query);
      } else {
        // 쿼리가 없으면 기본 위치로
        if (mapRef.current) {
          mapRef.current.setCenter(defaultPosition);
          mapRef.current.setLevel(5);
          
          // 마커 제거
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
        }
      }
    });
  }, [query]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default KakaoMap;
