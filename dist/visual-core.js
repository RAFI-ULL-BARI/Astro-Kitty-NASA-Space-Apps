// @ts-ignore Translation source is shared with the browser modules.
import { copy } from './strings.js?v=10';
export const clamp01 = (value) => Math.max(0, Math.min(1, value));
export const easeInOut = (value) => { const p = clamp01(value); return p * p * (3 - 2 * p); };
export const easeOut = (value) => 1 - (1 - clamp01(value)) ** 3;
export const lerp = (from, to, progress) => from + (to - from) * clamp01(progress);
export function damp(from, to, rate, dt) { return lerp(from, to, 1 - Math.exp(-Math.max(0, rate) * Math.max(0, dt))); }
export function turnToward(from, to, rate, dt) { const delta = Math.atan2(Math.sin(to - from), Math.cos(to - from)); return from + delta * (1 - Math.exp(-rate * Math.max(0, dt))); }
export function pathProgress(time, duration) { return easeInOut(duration > 0 ? time / duration : 1); }
export function frameDelta(previous, timestamp) { return previous > 0 ? Math.max(0, Math.min(.05, (timestamp - previous) / 1000)) : 0; }
const surfaces = new WeakMap();
/** Resize on layout changes, not through layout measurements during every frame. */
export function prepareCanvas(canvas, width, height) {
    let record = surfaces.get(canvas);
    if (!record) {
        record = { cssWidth: canvas.clientWidth || width, cssHeight: canvas.clientHeight || height, ratio: globalThis.devicePixelRatio || 1 };
        surfaces.set(canvas, record);
        if (typeof ResizeObserver !== 'undefined') {
            const current = record;
            current.observer = new ResizeObserver(entries => { const rect = entries[0]?.contentRect; if (rect?.width) {
                current.cssWidth = rect.width;
                current.cssHeight = rect.height;
                current.ratio = globalThis.devicePixelRatio || 1;
            } });
            current.observer.observe(canvas);
        }
    }
    const ratio = Math.min(2, Math.max(1, globalThis.devicePixelRatio || record.ratio));
    const visibleWidth = canvas.dataset?.fit === 'cover' ? Math.max(record.cssWidth, record.cssHeight * width / height) : record.cssWidth;
    const proposed = Math.max(1, Math.round(visibleWidth * ratio));
    const pixelWidth = Math.min(proposed, Math.round(Math.sqrt(4_200_000 * width / height)));
    const pixelHeight = Math.max(1, Math.round(pixelWidth * height / width));
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx)
        throw new Error('This browser needs Canvas 2D to play.');
    ctx.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.clearRect(0, 0, width, height);
    return ctx;
}
const DISSOLVE_SECONDS = .72;
/** A reusable low-resolution frame keeps cuts smooth on small screens. */
export function createSceneDissolve() {
    let previous;
    let cutTime = null;
    return {
        reset() { cutTime = null; },
        capture(canvas, seconds, reduced) {
            cutTime = null;
            if (reduced || typeof document === 'undefined' || !canvas.width || !canvas.height)
                return;
            previous ??= document.createElement('canvas');
            const width = Math.min(canvas.width, 960);
            const height = Math.max(1, Math.round(canvas.height * width / canvas.width));
            if (previous.width !== width || previous.height !== height) {
                previous.width = width;
                previous.height = height;
            }
            const ctx = previous.getContext('2d');
            if (!ctx)
                return;
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(canvas, 0, 0, width, height);
            cutTime = seconds;
        },
        paint(ctx, width, height, seconds, reduced) {
            if (reduced || cutTime === null || !previous)
                return;
            const age = seconds - cutTime;
            if (age < 0 || age >= DISSOLVE_SECONDS) {
                cutTime = null;
                return;
            }
            ctx.save();
            ctx.globalAlpha = 1 - easeInOut(age / DISSOLVE_SECONDS);
            ctx.drawImage(previous, 0, 0, width, height);
            ctx.restore();
        }
    };
}
export function filmCopyOpacity(secondsIntoScene, reduced) {
    return reduced ? 1 : .64 + .36 * easeInOut(secondsIntoScene / .42);
}
const academyScript = copy('academyFilm');
export const ARRIVAL_CHAPTERS = [
    { start: 0, end: 5, title: academyScript[0][0], line: academyScript[0][1], audio: 'earth' },
    { start: 5, end: 9, title: academyScript[1][0], line: academyScript[1][1], audio: 'bangladesh' },
    { start: 9, end: 13, title: academyScript[2][0], line: academyScript[2][1], audio: 'khulna' },
    { start: 13, end: 19, title: academyScript[3][0], line: academyScript[3][1], audio: 'center' },
    { start: 19, end: 24, title: academyScript[4][0], line: academyScript[4][1], audio: 'academy' }
];
export const ARRIVAL_DURATION = ARRIVAL_CHAPTERS.at(-1).end;
export function arrivalChapter(seconds) { return Math.max(0, ARRIVAL_CHAPTERS.findIndex(part => seconds < part.end) === -1 ? ARRIVAL_CHAPTERS.length - 1 : ARRIVAL_CHAPTERS.findIndex(part => seconds < part.end)); }
