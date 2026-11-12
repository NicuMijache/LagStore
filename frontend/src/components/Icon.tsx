/** Iconițe SVG outline, care moștenesc culoarea textului. */
const PATHS = {
  heart: 'M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z',
  cart: 'M3 4h2l2.4 11h10.2L20 8H6.2M10 20h.01M17 20h.01',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4',
  arrowLeft: 'M19 12H5m6-6-6 6 6 6',
  arrowRight: 'M5 12h14m-6-6 6 6-6 6',
  close: 'M6 6l12 12M18 6 6 18',
  chevronDown: 'm6 9 6 6 6-6',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  menu: 'M4 9h16M4 15h16',
  truck: 'M3 6h11v10H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  box: 'M4 8l8-4 8 4v8l-8 4-8-4V8Zm0 0 8 4 8-4M12 12v8',
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  size?: number;
  /** Umple conturul (ex: inima activă) */
  filled?: boolean;
}

export default function Icon({ name, size = 22, filled = false }: Props) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
