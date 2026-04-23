import type { ScryfallCard, RealCard } from '@/types';

const BASE = 'https://api.scryfall.com';

export async function searchCards(query: string): Promise<{ name: string; id: string }[]> {
  if (!query || query.length < 2) return [];
  const url = `${BASE}/cards/autocomplete?q=${encodeURIComponent(query)}&include_extras=false`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.data as string[]).slice(0, 10).map(name => ({ name, id: name }));
}

export async function getCardByName(name: string): Promise<ScryfallCard | null> {
  const url = `${BASE}/cards/named?exact=${encodeURIComponent(name)}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

export async function getCardById(id: string): Promise<ScryfallCard | null> {
  const url = `${BASE}/cards/${id}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  return res.json();
}

export function scryfallToRealCard(sc: ScryfallCard): RealCard {
  const face = sc.card_faces?.[0];
  return {
    id: sc.id,
    scryfallId: sc.id,
    name: sc.name,
    manaCost: sc.mana_cost ?? face?.mana_cost ?? '',
    cmc: sc.cmc,
    colors: (sc.colors ?? []) as RealCard['colors'],
    colorIdentity: sc.color_identity as RealCard['colorIdentity'],
    type: sc.type_line,
    oracleText: sc.oracle_text ?? face?.oracle_text ?? '',
    flavorText: sc.flavor_text,
    power: sc.power,
    toughness: sc.toughness,
    loyalty: sc.loyalty,
    rarity: sc.rarity as RealCard['rarity'],
    setCode: sc.set,
    setName: sc.set_name,
    imageUrl: sc.image_uris?.normal ?? face?.image_uris?.normal ?? '',
    year: parseInt(sc.released_at.split('-')[0]),
  };
}

export function getArtCrop(sc: ScryfallCard): string {
  return sc.image_uris?.art_crop ?? sc.card_faces?.[0]?.image_uris?.art_crop ?? '';
}
