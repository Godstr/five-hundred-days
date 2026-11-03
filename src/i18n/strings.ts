/**
 * Every piece of interface text, in English and Mongolian.
 * The personal content (tracks, letter…) lives in src/config/story.ts.
 * {name} placeholders are filled in by t().
 */
export const STRINGS = {
  // Language switch
  'lang.label': { en: 'Language', mn: 'Хэл' },

  // Intro
  'intro.needle': { en: 'placing the needle…', mn: 'зүүг тавьж байна…' },
  'intro.for': { en: 'a little album for {to}', mn: '{to} зориулсан бяцхан цомог' },
  'intro.play': { en: 'Put the record on', mn: 'Пянзаа тавья' },
  'intro.quiet': { en: 'or come in quietly', mn: 'эсвэл чимээгүй орох' },
  'intro.headphones': { en: 'better with headphones', mn: 'чихэвчтэй сонсвол илүү гоё' },

  // Top bar
  'nav.tracklist': { en: 'Tracklist', mn: 'Дуунууд' },
  'nav.liner': { en: 'Liner notes', mn: 'Тэмдэглэл' },
  'nav.vault': { en: 'The vault', mn: 'Нууц сейф' },
  'nav.top': { en: 'Back to top', mn: 'Дээш буцах' },
  'music.play': { en: 'Play music', mn: 'Хөгжим тоглуулах' },
  'music.pause': { en: 'Pause music', mn: 'Хөгжмийг зогсоох' },

  // Hero
  'hero.eyebrow': { en: 'An album in 500 days · for {to}', mn: '500 өдрийн цомог · {to} зориулав' },
  'hero.title1': { en: 'Five hundred', mn: 'Бидний' },
  'hero.title2': { en: 'days of us.', mn: 'таван зуун өдөр.' },
  'hero.desc': {
    en: 'A private release for my favorite voice. Recorded live, every single day since {date}. Press play.',
    mn: 'Миний хамгийн дуртай хоолойд зориулсан хувийн цомог. Эхэлсэн өдөр: {date}. Тэр цагаас хойш өдөр бүр шууд бичигдсэн.',
  },
  'hero.play': { en: 'Play side A', mn: 'А талыг тоглуулах' },
  'hero.pause': { en: 'Pause', mn: 'Зогсоох' },
  'hero.tracklist': { en: 'The tracklist', mn: 'Дуунууд' },
  'hero.sideB': { en: 'Side B', mn: 'Б тал' },

  // Counter
  'counter.label': { en: 'Days together', mn: 'Хамтдаа өнгөрүүлсэн' },
  'counter.days': { en: 'days', mn: 'өдөр' },
  'counter.hours': { en: 'hours', mn: 'цаг' },
  'counter.min': { en: 'min', mn: 'мин' },
  'counter.sec': { en: 'sec', mn: 'сек' },
  'counter.since': { en: 'since {date}', mn: 'эхэлсэн: {date}' },
  'counter.today': { en: 'Today is Day {n}', mn: 'Өнөөдөр {n} дахь өдөр' },
  'counter.cheers': { en: 'happy anniversary ♡', mn: 'баяр хүргэе ♡' },
  'counter.next': { en: 'Next milestone:', mn: 'Дараагийн онцгой өдөр:' },
  'counter.in': { en: 'in {n} days', mn: '{n} хоногийн дараа' },

  // Shared
  day: { en: 'Day {n}', mn: 'Өдөр {n}' },
  play: { en: 'Play', mn: 'Тоглуулах' },
  pause: { en: 'Pause', mn: 'Зогсоох' },
  close: { en: 'Close', mn: 'Хаах' },

  // Record label
  'vinyl.label': { en: '{title} · Side A · 33⅓ RPM · For {to} · ', mn: '{title} · А тал · 33⅓ RPM · {to} зориулав · ' },
  'vinyl.side': { en: 'side a', mn: 'а тал' },

  // Turntable
  'deck.loading': { en: 'placing the needle…', mn: 'зүүг тавьж байна…' },
  'deck.playing': { en: 'now playing · {title}', mn: 'эгшиглэж байна · {title}' },
  'deck.idle': { en: 'tap the record', mn: 'пянз дээр дар' },

  // Marquee
  'marquee.days': { en: '{n} days', mn: '{n} өдөр' },
  'marquee.hours': { en: '{n} hours', mn: '{n} цаг' },
  'marquee.voice': { en: 'one voice', mn: 'нэг хоолой' },
  'marquee.bugs': { en: 'zero bugs', mn: 'тэг алдаа' },
  'marquee.sides': { en: 'side a · side b', mn: 'а тал · б тал' },
  'marquee.encore': { en: 'encore forever', mn: 'үүрд дахиад' },

  // Section headings
  'tracklist.kicker': { en: 'Side B', mn: 'Б тал' },
  'tracklist.title': { en: 'The tracklist', mn: 'Дуунууд' },
  'tracklist.accent': { en: '{n} songs, one story.', mn: '{n} дуу, нэг түүх.' },
  'liner.kicker': { en: 'Liner notes', mn: 'Тэмдэглэл' },
  'liner.title': { en: 'Written', mn: 'Мөр' },
  'liner.accent': { en: 'between the lines.', mn: 'хоорондын үгс.' },
  'credits.kicker': { en: 'Credits', mn: 'Бүтээгчид' },
  'credits.title': { en: 'Recorded live', mn: 'Шууд бичлэг' },
  'credits.accent': { en: 'no overdubs, no retakes.', mn: 'засваргүй, давталтгүй.' },
  'vault.kicker': { en: 'Hidden track', mn: 'Нууц дуу' },
  'vault.title': { en: 'The vault', mn: 'Нууц сейф' },
  'vault.accent': { en: 'for your eyes only.', mn: 'зөвхөн чамд.' },

  // Tracklist
  'album.label': { en: 'Album', mn: 'Цомог' },
  'album.meta': { en: '{artist} · {n} songs · {days} days', mn: '{artist} · {n} дуу · {days} өдөр' },
  'album.play': { en: 'Play the album', mn: 'Цомгийг тоглуулах' },
  'album.shuffle': { en: 'Play a random memory', mn: 'Санамсаргүй дурсамж тоглуулах' },
  'sleeve.number': { en: 'No. 500', mn: '№ 500' },
  'sleeve.title1': { en: 'Five hundred', mn: 'Таван зуун' },
  'sleeve.title2': { en: 'days of us', mn: 'бидний өдрүүд' },
  'sleeve.sticker1': { en: 'Sentimental', mn: 'Сэтгэлийн' },
  'sleeve.sticker2': { en: 'Advisory', mn: 'Анхаар' },
  'sleeve.sticker3': { en: 'Explicit love', mn: 'Хэт их хайр' },

  // Memory sheet
  'sheet.track': { en: 'Track {i} / {n}', mn: 'Дуу {i} / {n}' },
  'sheet.voice': { en: 'Voice note', mn: 'Дуут зурвас' },
  'sheet.instrumental': { en: 'Instrumental · composed in code', mn: 'Хөгжим · кодоор зохиосон' },
  'polaroid.flip': { en: 'Flip the photo over', mn: 'Зургийг эргүүлэх' },
  'polaroid.unflip': { en: 'Turn the photo back over', mn: 'Зургийг буцааж эргүүлэх' },
  'polaroid.hint': { en: 'tap the photo · there’s more on the back', mn: 'зураг дээр дар · ар талд нь бас бий' },
  'polaroid.hintBack': { en: 'tap to turn it back', mn: 'дарж буцааж эргүүл' },
  'polaroid.back': { en: 'Track {i} · Day {d}', mn: 'Дуу {i} · Өдөр {d}' },

  // Player
  'player.prev': { en: 'Previous memory', mn: 'Өмнөх дурсамж' },
  'player.next': { en: 'Next memory', mn: 'Дараагийн дурсамж' },
  'player.seek': { en: 'Seek', mn: 'Гүйлгэх' },
  'mini.track': { en: 'Track {i} · {album}', mn: 'Дуу {i} · {album}' },
  'mini.next': { en: 'Next track', mn: 'Дараагийн дуу' },

  // Credits
  'credits.personnel': { en: 'Personnel', mn: 'Оролцогчид' },
  'stats.hours': { en: 'hours together', mn: 'хамт өнгөрүүлсэн цаг' },
  'stats.minutes': { en: 'minutes, every one counted', mn: 'минут, нэг бүрийг нь тоолсон' },
  'stats.seconds': { en: 'seconds, and counting', mn: 'секунд, тоологдсоор' },
  'stats.beats': { en: 'heartbeats, give or take', mn: 'зүрхний цохилт, ойролцоогоор' },

  // Footer
  'footer.kicker': { en: 'To be continued', mn: 'Үргэлжлэл бий' },
  'footer.encore': { en: 'encore.', mn: 'дахиад.' },
  'footer.next': {
    en: 'The next track drops on {day}, {date}. That’s {n} days from now. I’ll be counting every one.',
    mn: 'Дараагийн дуу: {day} ({date}). Одоогоос {n} хоног үлдлээ. Би өдөр бүрийг тоолно.',
  },
  'footer.again': { en: 'Play it again', mn: 'Дахин тоглуулах' },
  'footer.made': { en: 'Made with ♥, React and too much coffee by {me}.', mn: '♥, React, бас хэт их кофегоор бүтээсэн: {me}.' },
  'footer.psstDesktop': { en: 'psst: press Ctrl + Shift + L, or open the console', mn: 'пс: Ctrl + Shift + L дар, эсвэл консолоо нээ' },
  'footer.psstTouch': { en: 'psst: tap the 500 logo five times', mn: 'пс: 500 лого дээр таван удаа дар' },

  // Vault
  'vault.intro': { en: 'Every great album has a hidden track', mn: 'Гайхалтай цомог бүрт нууц дуу байдаг' },
  'vault.needsCode': { en: 'This one needs a code.', mn: 'Үүнийг нээхэд код хэрэгтэй.' },
  'vault.granted': { en: 'Access granted', mn: 'Нэвтрэх эрх олгогдлоо' },
  'vault.found': { en: 'You found it.', mn: 'Чи оллоо.' },
  'vault.inside': {
    en: 'There’s a letter inside, sealed with a heart. It’s been waiting five hundred days for you.',
    mn: 'Дотор нь зүрхээр битүүмжилсэн захидал байна. Чамайг таван зуун өдөр хүлээсэн.',
  },
  'vault.open': { en: 'Open the letter', mn: 'Захидлыг нээх' },
  'vault.reread': { en: 'Read it again', mn: 'Дахин унших' },
  'vault.lock': { en: 'Lock it again', mn: 'Дахин түгжих' },
  'vault.toast': { en: 'Hidden track unlocked ♡', mn: 'Нууц дуу нээгдлээ ♡' },
  'keypad.progress': { en: '{n} of {m} digits entered', mn: '{n}/{m} орон оруулсан' },
  'keypad.delete': { en: 'Delete last digit', mn: 'Сүүлийн оронг устгах' },
  'envelope.open': { en: 'Break the seal and open the letter', mn: 'Лацыг эвдэж захидлыг нээх' },
  'envelope.again': { en: 'Read the letter again', mn: 'Захидлыг дахин унших' },
  'envelope.for': { en: 'for {to}', mn: '{to}' },
  'letter.header': { en: 'Hidden track · Day {n}', mn: 'Нууц дуу · Өдөр {n}' },
  'letter.close': { en: 'Close the letter', mn: 'Захидлыг хаах' },

  // Easter eggs
  'terminal.label': { en: 'A secret note', mn: 'Нууц зурвас' },
  'terminal.skip': { en: 'tap to skip · esc to close', mn: 'алгасах бол дар · хаах бол esc' },
  'terminal.done': { en: 'esc or tap outside to close · i love you', mn: 'хаах бол esc эсвэл гадна дар · хайртай шүү' },
  'terminal.ok': {
    en: '✔ access granted. uptime: {n} days. expiry: never.',
    mn: '✔ эрх олгогдлоо. ажилласан хугацаа: {n} өдөр. дуусах хугацаа: хэзээ ч үгүй.',
  },
  'console.title': { en: '{n} days of you.', mn: 'Чамтай {n} өдөр.' },
  'console.hint': {
    en: 'psst: type love() and press Enter. Or press Ctrl + Shift + L.',
    mn: 'пс: love() гэж бичээд Enter дар. Эсвэл Ctrl + Shift + L.',
  },
  'console.love': { en: 'I love you. Uptime: {n} days, no downtime.', mn: 'Би чамд хайртай. {n} өдөр тасралтгүй.' },
  'console.toast': { en: 'psst… check the console 👀', mn: 'пс… консолоо хар 👀' },
} satisfies Record<string, { en: string; mn: string }>

export type StringKey = keyof typeof STRINGS
