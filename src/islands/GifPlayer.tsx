import { useEffect, useState } from 'react';

type Props = { still: string; motion?: string; alt: string };

type Mode = 'still' | 'motion' | 'paused';

// 처음 HTML에는 정지 이미지만 넣는다. 스크립트가 없으면 정지 이미지가 최종 상태이고,
// 첫 화면에서 큰 GIF를 기다리지 않아 가장 큰 이미지가 빨리 그려진다.
// 살아나면 GIF로 바꾸고, 동작 줄이기 사용자에게는 정지 이미지와 재생 버튼을 보여 준다.
export default function GifPlayer({ still, motion, alt }: Props) {
  const [mode, setMode] = useState<Mode>('still');

  useEffect(() => {
    if (!motion) return;
    setMode(window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'paused' : 'motion');
  }, [motion]);

  return (
    <div className="gif-player">
      <div className="phone phone--lg">
        <img src={mode === 'motion' && motion ? motion : still} alt={alt} />
      </div>
      {mode === 'paused' && (
        <button type="button" className="play-button" onClick={() => setMode('motion')}>움직이는 화면 보기</button>
      )}
    </div>
  );
}
