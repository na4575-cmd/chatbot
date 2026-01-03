
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, GroundingSource } from './types';
import { RECOMMENDED_AREAS } from './constants';
import { getGeminiResponse } from './services/geminiService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '안녕하세요! 블랙 & 윈터 테마로 더욱 세련되게 변신한 세종특별자치시 스마트 가이드입니다. ❄️🖤\n세종시의 명소, 주소, 맛집을 물어보시면 상세한 정보와 함께 지도를 안내해 드릴게요!',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [activeMapQuery, setActiveMapQuery] = useState<string>('세종특별자치시');
  const [isMapVisible, setIsMapVisible] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 접속 위치 권한 획득
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("위치 정보 접근 권한이 거부되었습니다.", err)
      );
    }
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await getGeminiResponse(text, location?.lat, location?.lng);
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: result.text,
        timestamp: new Date(),
        groundingSources: result.sources,
      };

      setMessages(prev => [...prev, modelMessage]);

      const mapSource = result.sources.find(s => s.type === 'maps');
      if (mapSource) {
        setActiveMapQuery(mapSource.title);
      } else {
        const areaMatch = RECOMMENDED_AREAS.find(a => text.includes(a.name));
        if (areaMatch) {
          setActiveMapQuery(areaMatch.name);
        }
      }
    } catch (error) {
      console.error("Error during message sending:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-black overflow-hidden font-['Pretendard'] relative">
      
      {/* 채팅 인터페이스 (다크 윈터 스타일) */}
      <div className={`flex flex-col h-full bg-[#0a0f1d]/90 backdrop-blur-xl shadow-2xl transition-all duration-500 ease-in-out border-r border-white/5 relative z-20 ${isMapVisible ? 'w-full md:w-[480px] lg:w-[550px]' : 'w-full'}`}>
        
        {/* 헤더 */}
        <header className="bg-black/40 p-5 text-white flex items-center justify-between shrink-0 border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <i className="fa-solid fa-snowflake text-2xl animate-pulse"></i>
            </div>
            <div>
              <h1 className="font-bold text-xl leading-tight">세종 AI 다크 가이드</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400"></span>
                </span>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Night mode active</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsMapVisible(!isMapVisible)}
            className="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <i className={`fa-solid ${isMapVisible ? 'fa-angles-left' : 'fa-moon'}`}></i>
          </button>
        </header>

        {/* 채팅 영역 */}
        <main ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth bg-gradient-to-b from-black via-[#0a0f1d] to-black">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[92%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-lg
                  ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-blue-400 border border-white/5'}`}>
                  <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                </div>
                <div className="space-y-2">
                  <div className={`p-4 rounded-2xl shadow-lg text-[14px] leading-relaxed whitespace-pre-wrap
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-slate-800/80 backdrop-blur-md text-slate-200 rounded-tl-none border border-white/5'}`}>
                    {msg.text}
                  </div>
                  
                  {msg.groundingSources && msg.groundingSources.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="text-[11px] font-bold text-blue-500/80 px-1 uppercase tracking-tight flex items-center gap-1.5">
                        <i className="fa-solid fa-icicles text-[10px]"></i> AI Search Results
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.groundingSources.map((source, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (source.type === 'maps') {
                                setActiveMapQuery(source.title);
                                setIsMapVisible(true);
                              } else {
                                window.open(source.uri, '_blank');
                              }
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all group
                              ${source.type === 'maps' 
                                ? 'bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30' 
                                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                          >
                            <i className={`fa-solid ${source.type === 'maps' ? 'fa-location-dot' : 'fa-link'} text-xs`}></i>
                            <span className="text-xs font-bold truncate max-w-[150px]">{source.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 block px-1 font-medium">{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-4">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                </div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generating Dark Insight...</span>
              </div>
            </div>
          )}
        </main>

        {/* 하단 입력창 */}
        <div className="p-5 bg-black border-t border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="세종시 명소를 다크 모드로 탐험하세요..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-2 focus:ring-blue-600 transition-all font-medium placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 shadow-lg
                ${!inputText.trim() || isLoading 
                  ? 'bg-slate-800 text-slate-600' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-90'}`}
            >
              <i className={`fa-solid ${isLoading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-lg`}></i>
            </button>
          </form>
          <div className="flex justify-center items-center mt-4">
             <div className="flex gap-3 items-center text-[10px] font-bold text-slate-600">
              <span className="flex items-center gap-1"><i className="fa-solid fa-moon"></i> DARK THEME</span>
              <div className="h-1 w-1 bg-slate-800 rounded-full"></div>
              <span className="flex items-center gap-1"><i className="fa-solid fa-location-crosshairs"></i> GEOLOCATION ON</span>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽: Google Maps */}
      {isMapVisible && (
        <div className="flex-1 relative h-[50vh] md:h-full bg-black overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&hl=ko&z=15&output=embed`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps"
            className="w-full h-full"
          ></iframe>
          
          {/* 지도 상단 정보 오버레이 (다크 윈터 스타일) */}
          <div className="absolute top-6 left-6 right-6 md:right-auto md:min-w-[320px] z-30">
            <div className="frosty-glass shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 rounded-[28px] flex items-start gap-4 animate-in slide-in-from-top duration-700">
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-slate-700 to-black flex items-center justify-center shrink-0 shadow-xl border border-white/10 relative">
                <i className="fa-solid fa-location-dot text-blue-500 text-2xl"></i>
                <div className="absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-sm">
                   <i className="fa-solid fa-snowflake text-[10px] text-white"></i>
                </div>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-1 block">Selected Area</span>
                <h2 className="text-lg font-bold text-white truncate tracking-tight">{activeMapQuery}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Live Tracker</span>
                </div>
              </div>
            </div>
          </div>

          {/* 모바일 닫기 버튼 */}
          <button 
            onClick={() => setIsMapVisible(false)}
            className="md:hidden absolute top-6 right-6 w-12 h-12 bg-black/60 backdrop-blur shadow-xl rounded-2xl flex items-center justify-center text-white border border-white/10"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
      )}
      
      {/* 지도 플로팅 버튼 */}
      {!isMapVisible && (
        <button 
          onClick={() => setIsMapVisible(true)}
          className="hidden md:flex absolute right-8 bottom-8 w-16 h-16 bg-blue-600 text-white shadow-2xl rounded-[24px] items-center justify-center hover:bg-blue-700 hover:scale-110 active:scale-95 transition-all z-50 border-4 border-black"
        >
          <i className="fa-solid fa-map-marked-alt text-2xl"></i>
        </button>
      )}
    </div>
  );
};

export default App;
