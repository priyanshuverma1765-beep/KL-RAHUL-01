export const chapters = [
  { year: "2010", kicker: "Early years", title: "A game begins", body: "From Karnataka's age-group system to first-class cricket — the foundations of an unusually adaptable batter.", image: "/images/rahul/journey/rahul-early.webp", stat: "KARNATAKA" },
  { year: "2014", kicker: "India debut", title: "The first step", body: "A Test debut in Melbourne opened an international career built across formats, positions and conditions.", image: "/images/rahul/journey/test-era-collage.jpg", stat: "TEST 284" },
  { year: "2016", kicker: "Multi-format rise", title: "No single shape", body: "An opener's patience. A white-ball batter's range. Rahul became the kind of player teams could reimagine.", image: "/images/rahul/journey/india-batting.jpg", stat: "3 FORMATS" },
  { year: "2021", kicker: "Overseas Test craft", title: "Built for the hard days", body: "New-ball movement, long spells, distant grounds — the technique kept finding a way forward.", image: "/images/rahul/journey/test-batter.jpg", stat: "OPENER" },
  { year: "2023", kicker: "Role evolution", title: "The keeper. The anchor.", body: "A move through the order reshaped his white-ball game and expanded his value behind the stumps.", image: "/images/rahul/journey/ipl-wicketkeeping.jpg", stat: "WK / BAT" },
  { year: "NOW", kicker: "The current era", title: "Still becoming", body: "The archive is not a monument to a finished story. It is a record of adaptation in motion.", image: "/images/rahul/journey/india-current.jpg", stat: "KLR 01" }
] as const;

export const formatData = {
  Test: [32, 44, 38, 62, 51, 71, 58],
  ODI: [42, 56, 48, 73, 67, 81, 76],
  T20I: [55, 62, 71, 68, 82, 74, 79],
  IPL: [61, 70, 66, 84, 77, 88, 82]
} as const;

export const archiveStats = [
  { label: "International formats", value: "03" },
  { label: "Documented roles", value: "05" },
  { label: "Career chapters", value: "06" },
  { label: "Story status", value: "LIVE" }
] as const;
