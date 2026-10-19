import { PresetKit, SoundPadData } from '../types';

const KEY_MAPPINGS = [
  '1', '2', '3', '4',
  'Q', 'W', 'E', 'R',
  'A', 'S', 'D', 'F',
  'Z', 'X', 'C', 'V',
];

// Helper to generate 16 pads
function createPad(
  index: number,
  name: string,
  soundId: string,
  group: SoundPadData['group'],
  color: string,
  triggerMode: SoundPadData['triggerMode'] = 'one-shot',
  options: Partial<SoundPadData> = {}
): SoundPadData {
  return {
    id: `pad-${index}`,
    name,
    soundId,
    group,
    color,
    keyShortcut: KEY_MAPPINGS[index] || '',
    midiNote: 36 + index, // Standard C1 to D#2 chromatic pad mapping
    triggerMode,
    volume: options.volume ?? 1.0,
    pan: options.pan ?? 0.0,
    pitch: options.pitch ?? 0,
    reverse: options.reverse ?? false,
    trimStart: options.trimStart ?? 0,
    trimEnd: options.trimEnd ?? 1.0,
    chokeGroup: options.chokeGroup,
    category: options.category ?? 'effects',
    ...options,
  };
}

// 1. EFFECTS & DROPS KIT (Live Sound System Essentials)
export const EFFECTS_DROPS_KIT: PresetKit = {
  id: 'kit-effects-drops',
  name: 'Sound System Effects & Big Drops',
  category: 'EFFECTS DROPS',
  description: 'Massive Jamaican reggae sound system blasts, cinematic impacts, dub sirens, sub drops, and riot risers for peak live hype.',
  bpm: 128,
  author: 'King Tubby Sound',
  likesCount: 1420,
  downloadsCount: 3890,
  tags: ['SoundSystem', 'Airhorn', 'SubDrop', 'DubSiren', 'LiveFX'],
  pads: [
    createPad(0, 'AIRHORN 3X', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
    createPad(1, 'DUB SIREN', 'fx-siren', 'fx', '#f59e0b', 'retrigger'),
    createPad(2, 'FM LASER', 'fx-laser', 'fx', '#06b6d4', 'one-shot'),
    createPad(3, 'SUB DROP 808', 'fx-subdrop', 'bass', '#8b5cf6', 'one-shot'),

    createPad(4, 'MEGA IMPACT', 'fx-impact', 'drops', '#ec4899', 'one-shot'),
    createPad(5, 'DJ SCRATCH', 'fx-scratch', 'fx', '#10b981', 'retrigger'),
    createPad(6, 'WHITE RISER', 'fx-riser', 'fx', '#3b82f6', 'one-shot'),
    createPad(7, 'GUNSHOT REVERB', 'fx-gunshot', 'drops', '#ef4444', 'one-shot'),

    createPad(8, 'VINE BOOM SUB', 'tt-boom', 'bass', '#a855f7', 'retrigger'),
    createPad(9, 'BRASS STOMP', 'tt-stomp', 'drops', '#f97316', 'one-shot'),
    createPad(10, 'TRANSITION WHOOSH', 'tt-swoosh', 'fx', '#06b6d4', 'one-shot'),
    createPad(11, 'SUSPENSE GONG', 'tt-gong', 'fx', '#eab308', 'one-shot'),

    createPad(12, 'LO-FI PUNCH KICK', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
    createPad(13, 'DUSTY SNARE', 'lofi-snare', 'drums', '#64748b', 'retrigger'),
    createPad(14, 'ANALOG CLAP', 'lofi-clap', 'drums', '#64748b', 'retrigger'),
    createPad(15, 'CHILL LO-FI LOOP', 'loop-lofi-chill', 'loops', '#22c55e', 'toggle-loop', { volume: 0.8 }),
  ],
};

// 2. TIKTOK & TIKTOK2 VIRAL DROPS
export const TIKTOK_VIRAL_KIT: PresetKit = {
  id: 'kit-tiktok-viral',
  name: 'TikTok Viral & Meme drops 2.0',
  category: 'TIKTOK & VIRAL',
  description: 'The definitive viral creator punchline pack. Vine boom, bruh vocal, record scratches, oh no chime, anime wow, and high-impact reaction drops.',
  bpm: 120,
  author: 'ViralStreamer_99',
  likesCount: 2840,
  downloadsCount: 8120,
  tags: ['TikTok', 'Meme', 'VineBoom', 'Creator', 'Drops', 'Comedy'],
  pads: [
    createPad(0, 'VINE BOOM', 'tt-boom', 'drops', '#ef4444', 'retrigger', { volume: 1.1 }),
    createPad(1, 'BRUH BASS', 'tt-bruh', 'drops', '#a855f7', 'retrigger'),
    createPad(2, 'RECORD SCRATCH', 'tt-scratch', 'fx', '#f59e0b', 'one-shot'),
    createPad(3, 'OH NO CHIME', 'tt-ohno', 'melodic', '#06b6d4', 'one-shot'),

    createPad(4, 'FAST SWOOSH', 'tt-swoosh', 'fx', '#3b82f6', 'one-shot'),
    createPad(5, 'SUSPENSE GONG', 'tt-gong', 'drops', '#eab308', 'one-shot'),
    createPad(6, 'ANIME WOW GLIDE', 'tt-wow', 'melodic', '#ec4899', 'one-shot'),
    createPad(7, '808 BRASS HORN', 'tt-stomp', 'bass', '#f97316', 'one-shot'),

    createPad(8, 'AIRHORN BLAST', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
    createPad(9, 'GUNSHOT POP', 'fx-gunshot', 'drops', '#8b5cf6', 'one-shot'),
    createPad(10, 'BABY SCRATCH', 'fx-scratch', 'fx', '#10b981', 'retrigger'),
    createPad(11, 'MEGA BOOM IMPACT', 'fx-impact', 'drops', '#ec4899', 'one-shot'),

    createPad(12, 'TRAP 808 SUB', 'lofi-808sub', 'bass', '#6366f1', 'retrigger'),
    createPad(13, 'SNAP CLAP', 'lofi-clap', 'drums', '#64748b', 'retrigger'),
    createPad(14, 'WOODEN RIMSHOT', 'lofi-rim', 'drums', '#64748b', 'retrigger'),
    createPad(15, 'DRILL HI-HAT LOOP', 'loop-trapdrill', 'loops', '#10b981', 'toggle-loop', { volume: 0.75 }),
  ],
};

// 3. BACKGROUND MUSIC & LOOPS
export const BACKGROUND_MUSIC_KIT: PresetKit = {
  id: 'kit-background-music',
  name: 'Background Music & Atmospheric Grooves',
  category: 'BACKGROUND LOOPS',
  description: 'Continuous rhythmic beds, deep house sidechains, warm neo-soul chords, and ambient drones for live transitions and streaming.',
  bpm: 110,
  author: 'Atmosphere Audio',
  likesCount: 980,
  downloadsCount: 2450,
  tags: ['Loops', 'Ambient', 'DeepHouse', 'NeoSoul', 'BGM'],
  pads: [
    createPad(0, 'LO-FI CHILL GROOVE', 'loop-lofi-chill', 'loops', '#10b981', 'toggle-loop', { volume: 0.85 }),
    createPad(1, 'DEEP HOUSE PUMP', 'loop-deephouse', 'loops', '#3b82f6', 'toggle-loop', { volume: 0.82 }),
    createPad(2, 'TRAP & DRILL BED', 'loop-trapdrill', 'loops', '#8b5cf6', 'toggle-loop', { volume: 0.8 }),
    createPad(3, 'WARM AMBIENT DRONE', 'loop-ambient', 'loops', '#06b6d4', 'toggle-loop', { volume: 0.9 }),

    createPad(4, 'NEO-SOUL RHODES 7TH', 'loop-jazzchords', 'loops', '#f59e0b', 'toggle-loop', { volume: 0.85 }),
    createPad(5, 'RHODES F#m9 STAB', 'lofi-rhodes', 'melodic', '#eab308', 'retrigger'),
    createPad(6, 'JAZZ GUITAR PLUCK', 'lofi-guitar', 'melodic', '#ec4899', 'retrigger'),
    createPad(7, '808 SUB GLIDE', 'lofi-808sub', 'bass', '#6366f1', 'retrigger'),

    createPad(8, 'LO-FI BASS DRUM', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
    createPad(9, 'TAPE SNARE', 'lofi-snare', 'drums', '#64748b', 'retrigger'),
    createPad(10, 'CRISPY CLOSED HAT', 'lofi-hihat-closed', 'drums', '#64748b', 'retrigger', { chokeGroup: 1 }),
    createPad(11, 'SIZZLE OPEN HAT', 'lofi-hihat-open', 'drums', '#64748b', 'retrigger', { chokeGroup: 1 }),

    createPad(12, 'AIRHORN BLIP', 'fx-airhorn', 'drops', '#ef4444', 'one-shot', { pitch: 3 }),
    createPad(13, 'SWOOSH RISER', 'fx-riser', 'fx', '#3b82f6', 'one-shot'),
    createPad(14, 'VINYL SCRATCH CUT', 'fx-scratch', 'fx', '#10b981', 'retrigger'),
    createPad(15, 'CINEMATIC BOOM', 'fx-impact', 'drops', '#a855f7', 'one-shot'),
  ],
};

// 4. STUDIO SAMPLER & LO-FI PULSE KIT
export const LOFI_PULSE_KIT: PresetKit = {
  id: 'kit-lofi-pulse',
  name: 'Studio Sampler & Lo-Fi Pulse Kit',
  category: 'STUDIO LO-FI PULSE',
  description: 'Punchy 12-bit lo-fi drums, warm Rhodes stabs, muted jazz guitar, deep 808 glide, and organic textures crafted for beatmakers.',
  bpm: 86,
  author: 'J Dilla Tribute Lab',
  likesCount: 3120,
  downloadsCount: 9400,
  tags: ['LoFi', 'Sampler', 'Boombap', 'TapeWarmth', 'Rhodes'],
  pads: [
    createPad(0, 'ROUND LO-FI KICK', 'lofi-kick', 'drums', '#ef4444', 'retrigger'),
    createPad(1, 'DUSTY TAPE SNARE', 'lofi-snare', 'drums', '#f97316', 'retrigger'),
    createPad(2, 'ANALOG CLAP ROOM', 'lofi-clap', 'drums', '#eab308', 'retrigger'),
    createPad(3, 'WOODEN RIMSHOT', 'lofi-rim', 'drums', '#84cc16', 'retrigger'),

    createPad(4, 'TAPE CLOSED HAT', 'lofi-hihat-closed', 'drums', '#10b981', 'retrigger', { chokeGroup: 1 }),
    createPad(5, 'SIZZLE OPEN HAT', 'lofi-hihat-open', 'drums', '#06b6d4', 'retrigger', { chokeGroup: 1 }),
    createPad(6, 'RHODES 9TH CHORD', 'lofi-rhodes', 'melodic', '#3b82f6', 'retrigger'),
    createPad(7, 'JAZZ GUITAR LICK', 'lofi-guitar', 'melodic', '#8b5cf6', 'retrigger'),

    createPad(8, '808 DEEP SUB GLIDE', 'lofi-808sub', 'bass', '#ec4899', 'retrigger'),
    createPad(9, 'CHILL HOP BEAT LOOP', 'loop-lofi-chill', 'loops', '#14b8a6', 'toggle-loop', { volume: 0.8 }),
    createPad(10, 'NEO-SOUL PROGRESSION', 'loop-jazzchords', 'loops', '#f43f5e', 'toggle-loop', { volume: 0.8 }),
    createPad(11, 'WARM AIR DRONE', 'loop-ambient', 'loops', '#a855f7', 'toggle-loop', { volume: 0.85 }),

    createPad(12, 'VINYL NEEDLE STOP', 'tt-scratch', 'fx', '#64748b', 'one-shot'),
    createPad(13, 'BABY CHIRP SCRATCH', 'fx-scratch', 'fx', '#64748b', 'retrigger'),
    createPad(14, 'SUB DROP BOOM', 'tt-boom', 'bass', '#64748b', 'one-shot'),
    createPad(15, 'SOUND SYSTEM HORN', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
  ],
};

// 5. TIKTOK VIRAL SONGS & TRENDING ANTHEMS
export const TIKTOK_TRENDING_SONGS_KIT: PresetKit = {
  id: 'kit-tiktok-trends',
  name: 'TikTok Viral Songs & Trending Anthems',
  category: 'TIKTOK SONGS & TRENDS',
  description: 'Trending drill vocal hooks, phonk drift brass, Afrobeats log drums, Jersey bounce, sped-up pop anthems, and dembow rhythms.',
  bpm: 130,
  author: 'ViralTrends_Lab',
  likesCount: 3840,
  downloadsCount: 11200,
  tags: ['TikTokSongs', 'Trending', 'Drill', 'Phonk', 'JerseyClub', 'Afrobeats'],
  pads: [
    createPad(0, 'DRILL HOOK BEAT', 'tt-song-drill', 'tiktok-songs', '#f43f5e', 'toggle-loop', { volume: 0.85 }),
    createPad(1, 'DRIFT PHONK ANTHEM', 'tt-song-phonk', 'tiktok-songs', '#a855f7', 'toggle-loop', { volume: 0.82 }),
    createPad(2, 'SPED-UP POP HOOK', 'tt-song-spedup', 'tiktok-songs', '#06b6d4', 'toggle-loop', { volume: 0.85 }),
    createPad(3, 'JERSEY CLUB BOUNCE', 'tt-song-jersey', 'tiktok-songs', '#f59e0b', 'toggle-loop', { volume: 0.82 }),

    createPad(4, 'AFROBEATS LOG DRUM', 'trend-afrobeats', 'trending-songs', '#10b981', 'toggle-loop', { volume: 0.85 }),
    createPad(5, 'FESTIVAL EDM DROP', 'trend-clubanthem', 'trending-songs', '#3b82f6', 'toggle-loop', { volume: 0.8 }),
    createPad(6, 'DEMBOW REGGAETON', 'trend-reggaeton', 'trending-songs', '#f97316', 'toggle-loop', { volume: 0.82 }),
    createPad(7, 'HYPERPOP PLUCK LEAD', 'trend-hyperpop', 'trending-songs', '#ec4899', 'toggle-loop', { volume: 0.78 }),

    createPad(8, '80S RETRO SYNTHWAVE', 'tt-song-synthwave', 'tiktok-songs', '#8b5cf6', 'toggle-loop', { volume: 0.8 }),
    createPad(9, 'VINE BOOM SUB', 'tt-boom', 'drops', '#ef4444', 'retrigger', { volume: 1.1 }),
    createPad(10, 'BRUH BASS DROP', 'tt-bruh', 'drops', '#a855f7', 'retrigger'),
    createPad(11, 'ANIME WOW GLIDE', 'tt-wow', 'melodic', '#ec4899', 'one-shot'),

    createPad(12, 'AIRHORN 3X BLAST', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
    createPad(13, 'SWOOSH WHOOSH', 'tt-swoosh', 'fx', '#06b6d4', 'one-shot'),
    createPad(14, 'SUSPENSE GONG', 'tt-gong', 'fx', '#eab308', 'one-shot'),
    createPad(15, 'BRASS 808 STOMP', 'tt-stomp', 'drops', '#f97316', 'one-shot'),
  ],
};

// 6. COMEDIC MEME SOUNDS & LAUGH FACTORY
export const COMEDIC_SOUNDS_KIT: PresetKit = {
  id: 'kit-comedic-memes',
  name: 'Comedic Sounds & Meme Laugh Factory',
  category: 'COMEDIC MEME SOUNDS',
  description: 'Slapstick cartoon spring boings, sad trombone fail, slide whistles, awkward crickets, goofy chuckles, and comedy punchlines.',
  bpm: 115,
  author: 'SlapstickStudio',
  likesCount: 2950,
  downloadsCount: 8400,
  tags: ['Comedic', 'Cartoon', 'Memes', 'SadTrombone', 'Boing', 'Laughs'],
  pads: [
    createPad(0, 'CARTOON BOING', 'comedy-boing', 'comedic', '#facc15', 'retrigger', { volume: 1.05 }),
    createPad(1, 'SAD TROMBONE FAIL', 'comedy-sadhorn', 'comedic', '#f97316', 'one-shot', { volume: 0.95 }),
    createPad(2, 'SLIDE WHISTLE & THUD', 'comedy-slip', 'comedic', '#06b6d4', 'one-shot'),
    createPad(3, 'AWKWARD CRICKETS', 'comedy-crickets', 'comedic', '#84cc16', 'retrigger'),

    createPad(4, 'GOOFY CHUCKLE LAUGH', 'comedy-laugh', 'comedic', '#ec4899', 'retrigger'),
    createPad(5, 'COMIC SLAP PUNCH', 'comedy-punch', 'comedic', '#ef4444', 'one-shot'),
    createPad(6, 'RECORD STOP SCRATCH', 'tt-scratch', 'fx', '#f59e0b', 'one-shot'),
    createPad(7, 'OH NO MARIMBA CHIME', 'tt-ohno', 'melodic', '#3b82f6', 'one-shot'),

    createPad(8, 'BRUH FORMANT VOCAL', 'tt-bruh', 'comedic', '#a855f7', 'retrigger'),
    createPad(9, 'VINE BOOM IMPACT', 'tt-boom', 'drops', '#ef4444', 'retrigger', { volume: 1.1 }),
    createPad(10, 'ANIME WOW REACTION', 'tt-wow', 'comedic', '#ec4899', 'one-shot'),
    createPad(11, 'DRAMATIC GONG HIT', 'tt-gong', 'fx', '#eab308', 'one-shot'),

    createPad(12, 'SOUND SYSTEM HORN', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
    createPad(13, 'BABY VINYL SCRATCH', 'fx-scratch', 'fx', '#10b981', 'retrigger'),
    createPad(14, 'BA-DUM-TSS RIMSHOT', 'lofi-rim', 'drums', '#64748b', 'retrigger'),
    createPad(15, 'PUNCH KICK ACCENT', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
  ],
};

// 7. WORSHIP & PRAISE SANCTUARY SOUNDSCAPE
export const WORSHIP_PRAISE_KIT: PresetKit = {
  id: 'kit-worship-praise',
  name: 'Worship Sanctuary & Ambient Praise',
  category: 'WORSHIP & PRAISE',
  description: 'Cathedral shimmer pads, intimate felt piano ballad chords, ambient swell guitars, acoustic praise loops, gospel Hammond B3, and choir drones.',
  bpm: 72,
  author: 'Sanctuary Sounds',
  likesCount: 3410,
  downloadsCount: 9600,
  tags: ['Worship', 'Praise', 'ShimmerPad', 'Cathedral', 'Gospel', 'Piano'],
  pads: [
    createPad(0, 'ETHER SHIMMER PAD', 'worship-shimmer', 'worship', '#38bdf8', 'toggle-loop', { volume: 0.9 }),
    createPad(1, 'FELT PIANO BALLAD', 'worship-piano', 'worship', '#f59e0b', 'toggle-loop', { volume: 0.85 }),
    createPad(2, 'AMBIENT SWELL GUITAR', 'worship-swell', 'worship', '#818cf8', 'one-shot', { volume: 0.85 }),
    createPad(3, 'ACOUSTIC PRAISE STRUM', 'worship-acoustic', 'worship', '#10b981', 'toggle-loop', { volume: 0.8 }),

    createPad(4, 'ANGELIC CHOIR HARMONY', 'worship-choir', 'worship', '#e879f9', 'toggle-loop', { volume: 0.85 }),
    createPad(5, 'GOSPEL HAMMOND B3', 'worship-organ', 'worship', '#fb923c', 'one-shot', { volume: 0.85 }),
    createPad(6, 'MAJESTIC PRAISE STRINGS', 'worship-strings', 'worship', '#38bdf8', 'toggle-loop', { volume: 0.88 }),
    createPad(7, 'NEO-SOUL RHODES 9TH', 'lofi-rhodes', 'melodic', '#facc15', 'retrigger', { volume: 0.85 }),

    createPad(8, 'WARM AIR DRONE BED', 'loop-ambient', 'loops', '#06b6d4', 'toggle-loop', { volume: 0.85 }),
    createPad(9, 'CHILL LO-FI PUNCH KICK', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
    createPad(10, 'DUSTY TAPE SNARE', 'lofi-snare', 'drums', '#64748b', 'retrigger'),
    createPad(11, 'ROOM HANDCLAP', 'lofi-clap', 'drums', '#64748b', 'retrigger'),

    createPad(12, 'MUTED CLOSED HAT', 'lofi-hihat-closed', 'drums', '#64748b', 'retrigger', { chokeGroup: 1 }),
    createPad(13, 'SIZZLE OPEN HAT', 'lofi-hihat-open', 'drums', '#64748b', 'retrigger', { chokeGroup: 1 }),
    createPad(14, 'DEEP 808 SUB NOTE', 'lofi-808sub', 'bass', '#64748b', 'retrigger', { volume: 0.85 }),
    createPad(15, 'CINEMATIC SHIMMER RISER', 'fx-riser', 'fx', '#38bdf8', 'one-shot', { volume: 0.75 }),
  ],
};

// COMMUNITY FEATURED PRESETS
export const COMMUNITY_KITS: PresetKit[] = [
  EFFECTS_DROPS_KIT,
  TIKTOK_VIRAL_KIT,
  TIKTOK_TRENDING_SONGS_KIT,
  COMEDIC_SOUNDS_KIT,
  WORSHIP_PRAISE_KIT,
  BACKGROUND_MUSIC_KIT,
  LOFI_PULSE_KIT,
  {
    id: 'kit-drill-heat',
    name: '808 Drill & London Grime Heat',
    category: 'COMMUNITY',
    description: 'Sliding 808s, triplet rimshots, sirens, and vocal chants optimized for club sound systems.',
    bpm: 142,
    author: 'DJ K-Vibe UK',
    likesCount: 1650,
    downloadsCount: 4200,
    tags: ['Drill', '808', 'UK', 'Grime', 'Bass'],
    pads: [
      createPad(0, 'DRILL GLIDE 808', 'lofi-808sub', 'bass', '#8b5cf6', 'retrigger', { pitch: -2 }),
      createPad(1, 'HEAVY 808 DROP', 'fx-subdrop', 'bass', '#ec4899', 'one-shot'),
      createPad(2, 'AIRHORN BLAST', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
      createPad(3, 'DUB SIREN', 'fx-siren', 'fx', '#f59e0b', 'retrigger'),
      createPad(4, 'FAST HAT ROLL LOOP', 'loop-trapdrill', 'loops', '#10b981', 'toggle-loop'),
      createPad(5, 'GUNSHOT REVERB', 'fx-gunshot', 'drops', '#ef4444', 'one-shot'),
      createPad(6, 'VINE BOOM RUMBLE', 'tt-boom', 'bass', '#a855f7', 'retrigger'),
      createPad(7, 'DJ SCRATCH CUT', 'fx-scratch', 'fx', '#06b6d4', 'retrigger'),
      createPad(8, 'LO-FI PUNCH KICK', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
      createPad(9, 'WOODEN RIMSHOT', 'lofi-rim', 'drums', '#64748b', 'retrigger'),
      createPad(10, 'TAPE SNARE', 'lofi-snare', 'drums', '#64748b', 'retrigger'),
      createPad(11, 'CLOSED HAT', 'lofi-hihat-closed', 'drums', '#64748b', 'retrigger'),
      createPad(12, 'BRASS STOMP', 'tt-stomp', 'drops', '#f97316', 'one-shot'),
      createPad(13, 'WHITE NOISE RISER', 'fx-riser', 'fx', '#3b82f6', 'one-shot'),
      createPad(14, 'DEEP HOUSE LOOP', 'loop-deephouse', 'loops', '#3b82f6', 'toggle-loop'),
      createPad(15, 'CINEMATIC IMPACT', 'fx-impact', 'drops', '#eab308', 'one-shot'),
    ],
  },
  {
    id: 'kit-festival-risers',
    name: 'Festival EDM Drops & Peak Energy',
    category: 'COMMUNITY',
    description: 'High octane build-ups, massive risers, lasers, and stadium horns engineered for mainstage festival impact.',
    bpm: 128,
    author: 'Mainstage Collective',
    likesCount: 2210,
    downloadsCount: 5740,
    tags: ['EDM', 'Festival', 'Drops', 'Stadium', 'BuildUp'],
    pads: [
      createPad(0, 'AIRHORN TRIPLE', 'fx-airhorn', 'drops', '#ef4444', 'retrigger'),
      createPad(1, 'FM LASER SHOT', 'fx-laser', 'fx', '#06b6d4', 'one-shot'),
      createPad(2, 'MEGA CINEMATIC IMPACT', 'fx-impact', 'drops', '#ec4899', 'one-shot'),
      createPad(3, 'WHITE NOISE RISER', 'fx-riser', 'fx', '#3b82f6', 'one-shot'),
      createPad(4, 'DUB REVERB SIREN', 'fx-siren', 'fx', '#f59e0b', 'retrigger'),
      createPad(5, 'GUNSHOT IMPACT', 'fx-gunshot', 'drops', '#ef4444', 'one-shot'),
      createPad(6, 'STADIUM BRASS STOMP', 'tt-stomp', 'drops', '#f97316', 'one-shot'),
      createPad(7, 'SUB DROP 808', 'fx-subdrop', 'bass', '#8b5cf6', 'one-shot'),
      createPad(8, 'DEEP HOUSE PUMP LOOP', 'loop-deephouse', 'loops', '#10b981', 'toggle-loop'),
      createPad(9, 'ANIME WOW GLIDE', 'tt-wow', 'melodic', '#ec4899', 'one-shot'),
      createPad(10, 'SUSPENSE GONG', 'tt-gong', 'fx', '#eab308', 'one-shot'),
      createPad(11, 'VINYL SCRATCH', 'fx-scratch', 'fx', '#10b981', 'retrigger'),
      createPad(12, 'ROUND KICK', 'lofi-kick', 'drums', '#64748b', 'retrigger'),
      createPad(13, 'ROOM CLAP', 'lofi-clap', 'drums', '#64748b', 'retrigger'),
      createPad(14, 'TAPE SNARE', 'lofi-snare', 'drums', '#64748b', 'retrigger'),
      createPad(15, 'WARM AMBIENT BED', 'loop-ambient', 'loops', '#a855f7', 'toggle-loop'),
    ],
  },
];
