'use client';

const designs = ['sketch', 'parcel', 'rolling'];
const directory = (process.env.NEXT_PUBLIC_BASE_PATH ?? '') + '/page-loaders/';
let previous: string | undefined;

function showLoader(image: HTMLImageElement | null) {
  if (!image || image.dataset.design) return;
  const choices = designs.filter((design) => design !== previous);
  previous = choices[Math.floor(Math.random() * choices.length)];
  image.alt = document.documentElement.lang.startsWith('ar') ? 'جارٍ التحميل' : 'Loading page';
  image.dataset.design = previous;
  image.src = directory + previous + '.svg';
}

export default function Loading() {
  return (
    <div role="status" className="grid min-h-48 place-items-center">
      <img ref={showLoader} src={directory + 'sketch.svg'} width={56} height={56} alt="Loading page" />
    </div>
  );
}
