/*
  Scroll Gallery — basat en el component de 21st.dev de soralabs
  (https://21st.dev/@soralabs/components/scroll-gallery).
  Adaptacions per a aquest portfolio:
  - sense el mode "embedded" (només pin a la finestra);
  - prefix, etiqueta (badge), alt i enllaç propis per a cada diapositiva;
  - `onNavigate` per navegar amb el router en lloc de recarregar la pàgina.
*/
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type CSSProperties, type MouseEvent, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { observeWindowResize, waitForScrollerReady } from "@/components/ui/scroll-gallery-utils/scroll-trigger-utils";

gsap.registerPlugin(ScrollTrigger);

const MASK_HIDDEN = "linear-gradient(to bottom, transparent 0%, transparent 100%)";
const MASK_REVEALED = "linear-gradient(to bottom, black 0%, black 100%)";

const MASKED_IMAGE_STYLE =
  "width:100%;height:100%;object-fit:cover;transform-origin:center center;backface-visibility:hidden;mask-size:100% 100%;-webkit-mask-size:100% 100%;mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat;will-change:transform,mask-image;";

const IMAGE_CONTAINER_STYLE =
  "position:absolute;top:0;left:0;width:100%;height:100%;transform:translateZ(0);backface-visibility:hidden;";

const LAYOUT = {
  root: "relative h-svh w-full overflow-hidden",
  images: "absolute inset-0 h-full w-full",
  imageFrame: "absolute inset-0 h-full w-full",
  image: "h-full w-full object-cover",
  info: "absolute top-1/2 left-0 z-[2] w-full -translate-y-1/2",
  infoInner: "flex gap-8",
  prefix: "flex-1",
  prefixText: "",
  badge: "",
  title: "relative flex-[2] overflow-hidden",
  titleText: "",
  link: "flex flex-1 justify-end",
  linkText: "",
} as const;

export interface ScrollGallerySlide {
  image: string;
  title: string;
  alt?: string;
  url?: string;
  linkLabel?: string;
  /** Text de la columna esquerra per a aquesta diapositiva */
  prefix?: string;
  /** Etiqueta petita (p. ex. "Concept art") */
  badge?: string;
}

export interface ScrollGalleryTiming {
  finalDelay?: number;
  initialDelay?: number;
  scaleFrom?: number;
  scaleTo?: number;
  stripRevealSpeed?: number;
  titleChangeThreshold?: number;
  titleDuration?: number;
  titleEase?: string;
  titleOffset?: string;
}

export type ScrollGalleryClassNames = Partial<Record<keyof typeof LAYOUT, string>>;

export interface ScrollGalleryProps {
  slides: ScrollGallerySlide[];
  className?: string;
  classNames?: ScrollGalleryClassNames;
  linkLabel?: string;
  prefixLabel?: string;
  pinStart?: string;
  refreshPriority?: number;
  /** Distància de scroll per transició, en vh. */
  scrollPerTransition?: number;
  scrub?: number;
  stripsCount?: number;
  timing?: ScrollGalleryTiming;
  onNavigate?: (url: string) => void;
  /** Contingut extra dins de la secció fixada (HUD, comptador…) */
  children?: React.ReactNode;
}

function resolveTiming(timing?: ScrollGalleryTiming) {
  const scaleFrom = timing?.scaleFrom ?? 1.25;
  const scaleTo = timing?.scaleTo ?? 1;
  const scaleRange = scaleFrom - scaleTo;
  return {
    initialDelay: timing?.initialDelay ?? 300,
    finalDelay: timing?.finalDelay ?? 300,
    titleChangeThreshold: timing?.titleChangeThreshold ?? 0.3,
    titleDuration: timing?.titleDuration ?? 0.3,
    titleEase: timing?.titleEase ?? "power2.out",
    titleOffset: timing?.titleOffset ?? "120%",
    scaleFrom,
    scaleTo,
    scaleStep: scaleRange / 2,
    stripRevealSpeed: timing?.stripRevealSpeed ?? 2,
  };
}

function createStripBounds(stripsCount: number) {
  return Array.from({ length: stripsCount }, (_, j) => {
    const posFromBottom = stripsCount - j - 1;
    const step = 100 / stripsCount;
    return {
      lower: (posFromBottom + 1) * step,
      upperGap: posFromBottom * step - 0.1,
      delay: (j / stripsCount) * 0.5,
    };
  });
}

function mergeIntervals(intervals: { top: number; bottom: number }[]) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a.top - b.top);
  const merged = [{ ...intervals[0] }];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    const next = intervals[i];
    if (next.top <= last.bottom) last.bottom = Math.max(last.bottom, next.bottom);
    else merged.push({ ...next });
  }
  return merged;
}

function buildStripMask(
  stripBounds: ReturnType<typeof createStripBounds>,
  getAdj: (j: number, bounds: (typeof stripBounds)[number]) => number,
) {
  const intervals: { top: number; bottom: number }[] = [];
  for (let j = 0; j < stripBounds.length; j++) {
    const bounds = stripBounds[j];
    const adj = Math.max(0, Math.min(1, getAdj(j, bounds)));
    if (adj <= 0) continue;
    const sliceHeight = bounds.lower - bounds.upperGap;
    intervals.push({ top: bounds.lower - adj * sliceHeight, bottom: bounds.lower });
  }
  const merged = mergeIntervals(intervals);
  if (!merged.length) return MASK_HIDDEN;
  const stops: string[] = [];
  let cursor = 0;
  for (const { top, bottom } of merged) {
    if (top > cursor) stops.push(`transparent ${cursor}%`, `transparent ${top}%`);
    stops.push(`black ${top}%`, `black ${bottom}%`);
    cursor = bottom;
  }
  if (cursor < 100) stops.push(`transparent ${cursor}%`, "transparent 100%");
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

function setMaskImage(el: HTMLElement, value: string) {
  el.style.maskImage = value;
  el.style.webkitMaskImage = value;
}

function createScaleSetter(el: HTMLElement, initialScale: number) {
  const apply = (value: number) => {
    el.style.transform = `translate3d(0, 0, 0) scale(${value})`;
  };
  apply(initialScale);
  return apply;
}

export function ScrollGallery({
  slides,
  stripsCount = 20,
  scrollPerTransition = 1000,
  scrub = 1,
  pinStart = "top top",
  timing: timingProp,
  prefixLabel,
  linkLabel = "Explore",
  className,
  classNames,
  refreshPriority = -1,
  onNavigate,
  children,
}: ScrollGalleryProps) {
  const classes = useMemo(() => {
    const out = { ...LAYOUT } as Record<keyof typeof LAYOUT, string>;
    for (const key of Object.keys(LAYOUT) as (keyof typeof LAYOUT)[]) out[key] = cn(LAYOUT[key], classNames?.[key]);
    return out;
  }, [classNames]);
  const timing = useMemo(() => resolveTiming(timingProp), [timingProp]);

  const sectionRef = useRef<HTMLElement>(null);
  const firstImgRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const prefixRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const slideImagesRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!slides.length) return;
      let disposed = false;
      let trigger: ScrollTrigger | null = null;
      let unbindResize: (() => void) | undefined;
      const createdContainers: HTMLDivElement[] = [];

      const mountGallery = async () => {
        const section = sectionRef.current;
        const slideImages = slideImagesRef.current;
        const titleEl = titleRef.current;
        const firstSlideImg = firstImgRef.current;
        if (!(section && slideImages && firstSlideImg && titleEl)) return;

        await waitForScrollerReady(window);
        if (disposed) return;

        const { finalDelay, initialDelay, scaleFrom, scaleStep, scaleTo, stripRevealSpeed, titleChangeThreshold, titleDuration, titleEase, titleOffset } =
          timing;

        const stripBounds = createStripBounds(stripsCount);
        const totalSlides = slides.length;
        const setFirstImgScale = createScaleSetter(firstSlideImg, scaleFrom);

        interface SlideLayer {
          img: HTMLImageElement;
          revealState: "hidden" | "animating" | "revealed";
          setScale: (v: number) => void;
          transitionIndex: number;
        }
        const slideLayers: SlideLayer[] = [];

        for (let i = 1; i < totalSlides; i++) {
          const imgContainer = document.createElement("div");
          imgContainer.style.cssText = IMAGE_CONTAINER_STYLE;
          const img = document.createElement("img");
          img.style.cssText = MASKED_IMAGE_STYLE;
          img.src = slides[i].image;
          img.alt = slides[i].alt ?? slides[i].title;
          img.decoding = "async";
          setMaskImage(img, MASK_HIDDEN);
          imgContainer.appendChild(img);
          slideImages.appendChild(imgContainer);
          createdContainers.push(imgContainer);
          slideLayers.push({ transitionIndex: i - 1, img, setScale: createScaleSetter(img, scaleFrom), revealState: "hidden" });
        }

        const transitionCount = totalSlides - 1;
        const totalScrollDistance = transitionCount * scrollPerTransition + initialDelay + finalDelay;

        const transitionRanges: { startPercent: number; endPercent: number }[] = [];
        let pos = initialDelay;
        for (let i = 0; i < transitionCount; i++) {
          const start = pos;
          const end = start + scrollPerTransition;
          transitionRanges.push({ startPercent: start / totalScrollDistance, endPercent: end / totalScrollDistance });
          pos = end;
        }

        function calculateImageProgress(scrollProgress: number) {
          const first = transitionRanges[0];
          const last = transitionRanges[transitionRanges.length - 1];
          if (!(first && last)) return 0;
          if (scrollProgress < first.startPercent) return 0;
          if (scrollProgress > last.endPercent) return transitionRanges.length;
          for (let i = 0; i < transitionRanges.length; i++) {
            const { startPercent, endPercent } = transitionRanges[i];
            if (scrollProgress >= startPercent && scrollProgress <= endPercent) {
              return i + (scrollProgress - startPercent) / (endPercent - startPercent);
            }
          }
          return transitionRanges.length;
        }

        function getScaleForImage(imageIndex: number, currentImageIndex: number, progress: number) {
          const diff = currentImageIndex + progress - imageIndex;
          if (diff <= 0) return scaleFrom;
          if (diff >= 2) return scaleTo;
          return scaleFrom - scaleStep * diff;
        }

        let currentTitleIndex = 0;
        let queuedTitleIndex: number | null = null;
        let isAnimating = false;
        let lastImageProgress = 0;

        function updateSlideMeta(index: number) {
          const slide = slides[index];
          if (linkRef.current) {
            linkRef.current.href = slide.url ?? "#";
            linkRef.current.textContent = slide.linkLabel ?? linkLabel;
          }
          if (prefixRef.current) prefixRef.current.textContent = slide.prefix ?? prefixLabel ?? "";
          if (badgeRef.current) {
            badgeRef.current.textContent = slide.badge ?? "";
            badgeRef.current.hidden = !slide.badge;
          }
        }

        function animateTitleChange(index: number, direction: "down" | "up") {
          if (!titleEl || index === currentTitleIndex || index < 0 || index >= slides.length) return;
          if (isAnimating) {
            queuedTitleIndex = index;
            return;
          }
          isAnimating = true;
          const outY = direction === "down" ? `-${titleOffset}` : titleOffset;
          const inY = direction === "down" ? titleOffset : `-${titleOffset}`;
          gsap.killTweensOf(titleEl);
          updateSlideMeta(index);
          gsap.to(titleEl, {
            y: outY,
            duration: titleDuration,
            ease: titleEase,
            onComplete: () => {
              titleEl.textContent = slides[index].title;
              gsap.set(titleEl, { y: inY });
              gsap.to(titleEl, {
                y: "0%",
                duration: titleDuration,
                ease: titleEase,
                onComplete: () => {
                  currentTitleIndex = index;
                  isAnimating = false;
                  if (queuedTitleIndex !== null && queuedTitleIndex !== currentTitleIndex) {
                    const next = queuedTitleIndex;
                    queuedTitleIndex = null;
                    animateTitleChange(next, direction);
                  }
                },
              });
            },
          });
        }

        function getTitleIndexForProgress(imageProgress: number) {
          const idx = Math.floor(imageProgress);
          return imageProgress - idx >= titleChangeThreshold ? Math.min(idx + 1, slides.length - 1) : idx;
        }

        const handleScrollUpdate = (progress: number) => {
          const imageProgress = calculateImageProgress(progress);
          const scrollDirection = imageProgress > lastImageProgress ? "down" : "up";
          const currentImageIndex = Math.floor(imageProgress);
          const imageSpecificProgress = imageProgress - currentImageIndex;

          const correctTitleIndex = getTitleIndexForProgress(imageProgress);
          if (correctTitleIndex !== currentTitleIndex) {
            queuedTitleIndex = correctTitleIndex;
            if (!isAnimating) animateTitleChange(correctTitleIndex, scrollDirection);
          }
          section.style.setProperty("--sg-progress", String(imageProgress / Math.max(1, transitionCount)));

          setFirstImgScale(getScaleForImage(0, currentImageIndex, imageSpecificProgress));
          for (const layer of slideLayers) {
            layer.setScale(getScaleForImage(layer.transitionIndex, currentImageIndex, imageSpecificProgress));
            if (layer.transitionIndex < currentImageIndex) {
              if (layer.revealState !== "revealed") {
                setMaskImage(layer.img, MASK_REVEALED);
                layer.revealState = "revealed";
              }
            } else if (layer.transitionIndex === currentImageIndex) {
              layer.revealState = "animating";
              setMaskImage(
                layer.img,
                buildStripMask(stripBounds, (_j, bounds) => Math.max(0, Math.min(1, (imageSpecificProgress - bounds.delay) * stripRevealSpeed))),
              );
            } else if (layer.revealState !== "hidden") {
              setMaskImage(layer.img, MASK_HIDDEN);
              layer.revealState = "hidden";
            }
          }
          lastImageProgress = imageProgress;
        };

        trigger = ScrollTrigger.create({
          trigger: section,
          start: pinStart,
          // ScrollTrigger no entén "vh" a `end`: ho passam a píxels (es recalcula en cada refresh)
          end: () => `+=${(totalScrollDistance / 100) * window.innerHeight}`,
          pin: true,
          pinSpacing: true,
          scrub,
          invalidateOnRefresh: true,
          refreshPriority,
          onUpdate: (self) => handleScrollUpdate(self.progress),
        });

        unbindResize = observeWindowResize(() => {
          ScrollTrigger.refresh();
        });

        ScrollTrigger.refresh();
        handleScrollUpdate(trigger.progress);
      };

      mountGallery().catch(() => {
        /* configuració avortada en desmuntar */
      });

      return () => {
        disposed = true;
        trigger?.kill();
        unbindResize?.();
        for (const el of createdContainers) el.remove();
      };
    },
    { scope: sectionRef, dependencies: [slides, stripsCount, scrollPerTransition, scrub, pinStart, timing, linkLabel, refreshPriority] },
  );

  const first = slides[0];

  const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!onNavigate || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    onNavigate(event.currentTarget.getAttribute("href") ?? "/");
  };

  return (
    <section className={cn(classes.root, className)} ref={sectionRef}>
      <div className={classes.images} ref={slideImagesRef}>
        <div className={classes.imageFrame}>
          {first ? (
            <img
              alt={first.alt ?? first.title}
              className={classes.image}
              ref={firstImgRef}
              src={first.image}
              style={{ backfaceVisibility: "hidden", transform: `translate3d(0, 0, 0) scale(${timing.scaleFrom})` } as CSSProperties}
            />
          ) : null}
        </div>
      </div>

      {children}

      {first ? (
        <div className={classes.info}>
          <div className={classes.infoInner}>
            <div className={classes.prefix}>
              <p className={classes.prefixText} ref={prefixRef}>
                {first.prefix ?? prefixLabel}
              </p>
              <span className={classes.badge} ref={badgeRef} hidden={!first.badge}>
                {first.badge}
              </span>
            </div>
            <div className={classes.title}>
              <p className={classes.titleText} ref={titleRef}>
                {first.title}
              </p>
            </div>
            <div className={classes.link}>
              <a className={classes.linkText} href={first.url ?? "#"} ref={linkRef} onClick={handleLinkClick}>
                {first.linkLabel ?? linkLabel}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ScrollGallery;
