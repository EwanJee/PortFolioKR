import { useEffect, useRef, useState } from 'react';

type Props = { still: string; motion?: string; alt: string };

type Mode = 'still' | 'motion' | 'paused';

// 페이지와 정지 이미지를 다 받고 이만큼 기다린 뒤 GIF를 받는다(사례 첫 부분의 등장 효과 0.35초가 끝난 뒤).
const MOTION_DELAY_MS = 500;

// 처음 HTML에는 정지 이미지만 넣는다. 스크립트가 없으면 정지 이미지가 최종 상태다.
// 큰 GIF는 페이지와 정지 이미지를 다 받은 뒤에 받는다. 먼저 받으면 첫 화면이 GIF를 기다리고, GIF가 가장 큰 요소로 잡힌다.
// 동작 줄이기 사용자에게는 정지 이미지와 재생 버튼을 보여 준다.
export default function GifPlayer({ still, motion, alt }: Props) {
  const [mode, setMode] = useState<Mode>('still');
  const [pageLoaded, setPageLoaded] = useState(false);
  const [stillLoaded, setStillLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (motion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) setMode('paused');
  }, [motion]);

  useEffect(() => {
    // 살아나기 전에 이미 다 받은 경우에는 load 이벤트를 놓치므로 상태로 확인한다.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setStillLoaded(true);
    if (document.readyState === 'complete') {
      setPageLoaded(true);
      return;
    }
    const onLoad = () => setPageLoaded(true);
    window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (!motion || mode !== 'still' || !pageLoaded || !stillLoaded) return;
    const timer = window.setTimeout(() => setMode('motion'), MOTION_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [motion, mode, pageLoaded, stillLoaded]);

  return (
    <div className="gif-player">
      <div className="phone phone--lg">
        <img ref={imgRef} src={mode === 'motion' && motion ? motion : still} alt={alt} fetchPriority="high" onLoad={() => setStillLoaded(true)} />
      </div>
      {mode === 'paused' && (
        <button type="button" className="play-button" onClick={() => setMode('motion')}>움직이는 화면 보기</button>
      )}
    </div>
  );
}
