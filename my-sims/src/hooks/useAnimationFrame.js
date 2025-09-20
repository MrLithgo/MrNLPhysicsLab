import { useRef, useEffect } from 'react';

// Simple hook that calls callback(dt) every RAF while enabled.
export default function useAnimationFrame(callback, enabled = true) {
    const cbRef = useRef(callback);
    cbRef.current = callback;

    useEffect(() => {
        if (!enabled) return;
        let raf = 0;
        let last = performance.now();
        function loop(t) {
            const dt = (t - last) / 1000;
            last = t;
            cbRef.current(dt);
            raf = requestAnimationFrame(loop);
        }
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [enabled]);
}
