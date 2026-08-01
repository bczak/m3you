import { Carousel, CarouselItem } from 'm3you';

const ITEMS = [
  { label: 'Coral', color: '#F2856D' },
  { label: 'Sand', color: '#E8C97E' },
  { label: 'Fern', color: '#78A585' },
  { label: 'Sky', color: '#7FA9D8' },
  { label: 'Plum', color: '#A17BB0' },
];

export default function CarouselBasic() {
  return (
    <Carousel
      label="Colour swatches"
      title="Palettes"
      itemHeight="10rem"
      style={{ width: '100%' }}
      showAllAction={<a href="#all-palettes">Show all</a>}
    >
      {ITEMS.map((item) => (
        <CarouselItem key={item.label} label={item.label} onClick={() => undefined}>
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'end start',
              padding: '0.75rem',
              backgroundColor: item.color,
              color: '#1b1b1f',
              fontWeight: 500,
            }}
          >
            {item.label}
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  );
}
