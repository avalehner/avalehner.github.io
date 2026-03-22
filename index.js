const currentPath = window.location.pathname
const pages = [
  { element: document.getElementById('home'), path: '/home.html' },
  { element: document.getElementById('projects'), path: '/projects.html' },
  { element: document.getElementById('art'), path: '/art.html' },
  { element: document.getElementById('about'), path: '/about.html' },
]
pages.forEach((page) => {
  if (currentPath === page.path) page.element.classList.add('current-page')
})

const sketch = (p) => {

  const makeMountain = (seed, baseY, peakAmp, numPeaks) => {
    p.randomSeed(seed)
    p.noiseSeed(seed + 100)
    let keyPoints = []
    keyPoints.push({ x: -10, y: p.height + 5 })

    for (let i = 0; i < numPeaks; i++) {
      let x = p.map(i, 0, numPeaks - 1, 0.2 * p.width, 0.8 * p.width)
      x += p.random(-p.width * 0.04, p.width * 0.04)
      const isPeak = i % 2 === 0  
      const y = isPeak
        ? baseY - p.random(peakAmp * 0.55, peakAmp)
        : baseY - p.random(peakAmp * 0.05, peakAmp * 0.3)
      keyPoints.push({ x, y })
    }
    keyPoints.push({ x: p.width , y: [p.height + 5] })

    let points = []
    for (let i = 0; i < keyPoints.length - 1; i++) {
      const a = keyPoints[i], b = keyPoints[i + 1]
      const steps = Math.max(3, Math.floor(Math.abs(b.x - a.x) / 2))
      for (let s = 0; s < steps; s++) {
        const t = s / steps
        const x = p.lerp(a.x, b.x, t)
        let y = p.lerp(a.y, b.y, t)
        y += (p.noise(x * 0.02 + seed) - 0.5) * 8
        points.push({ x, y })
      }
    }
    points.push(keyPoints[keyPoints.length - 1])
    return points
  }

  const makeGround = (seed) => {
    p.noiseSeed(seed)
    const points = []
    for (let x = 0; x <= p.width; x += 3) {
      const y = p.height * 0.86
        + (p.noise((x / p.width) * 50 + seed) - 0.5)
        * p.height * 0.025
      points.push({ x, y })
    }
    return points
  }

  const drawCactus = (cx, gy, ht, shade, numArms, a1side, a1frac, a1len, a2frac, a2len) => {
    const tw = Math.max(2.5, ht * 0.10)
    const [r, g, b] = shade
    const dark = [r-14, g-14, b-12]

    const drawArm = (side, frac, len) => {
      const jy = gy - ht * frac
      const jx = cx + side * tw * 0.8
      const ex = jx + side * len
      const aw = tw * 0.76
      const upLen = len * 0.92
      const armTop = jy - upLen
      p.fill(...dark); p.noStroke()
      p.beginShape()
        p.vertex(jx, jy-aw*0.5)
        p.bezierVertex(jx+side*len*0.3, jy-aw*0.4, ex-side*2, jy-aw*0.45, ex, jy-aw*0.35)
        p.vertex(ex, jy+aw*0.35)
        p.bezierVertex(ex-side*2, jy+aw*0.45, jx+side*len*0.3, jy+aw*0.4, jx, jy+aw*0.5)
      p.endShape(p.CLOSE)
      p.fill(...shade)
      p.beginShape()
        p.vertex(ex-aw*0.5, jy)
        p.bezierVertex(ex-aw*0.5, jy-upLen*0.3, ex-aw*0.45, armTop+4, ex-aw*0.35, armTop)
        p.bezierVertex(ex, armTop-aw*0.5, ex, armTop-aw*0.5, ex+aw*0.35, armTop)
        p.bezierVertex(ex+aw*0.45, armTop+4, ex+aw*0.5, jy-upLen*0.3, ex+aw*0.5, jy)
      p.endShape(p.CLOSE)
    }

    if (numArms >= 1) drawArm(a1side, a1frac, a1len)
    if (numArms >= 2) drawArm(-a1side, a2frac, a2len)

    p.fill(...dark); p.noStroke()
    p.beginShape()
      p.vertex(cx, gy)
      p.bezierVertex(cx, gy-ht*0.3, cx+tw*0.6, gy-ht*0.7, cx+tw*0.55, gy-ht)
      p.bezierVertex(cx+tw*0.1, gy-ht-tw*0.6, cx+tw*0.1, gy-ht-tw*0.6, cx+tw*0.6, gy-ht)
      p.vertex(cx+tw, gy-ht*0.3)
      p.vertex(cx+tw, gy)
    p.endShape(p.CLOSE)

    p.fill(...shade); p.noStroke()
    p.beginShape()

    // Left edge: walk from bottom to top
    for (let nt = 0; nt <= 1; nt += 0.1) {
      const lx = cx - tw * p.lerp(1.0, 0.55, nt)  // taper from base to top
      const ly = p.lerp(gy, gy - ht, nt)
      const noiseAmt = (p.noise(cx * 0.05 + nt * 4) - 0.5) * tw * 0.5
      p.vertex(lx + noiseAmt, ly)
    }

    //creates rounded top
    for (let at = 0; at <= 1; at += 0.1) {
      const topX = p.lerp(cx - tw * 0.55, cx + tw * 0.55, at)
      const topY = (gy - ht) - Math.sin(at * Math.PI) * tw * 0.65
      p.vertex(topX, topY)
    }

    // Right edge: walk from top back to bottom
    for (let nt = 1; nt >= 0; nt -= 0.1) {
      const rx = cx + tw * p.lerp(1.0, 0.55, nt)
      const ly = p.lerp(gy, gy - ht, nt)
      const noiseAmt = (p.noise(cx * 0.05 + nt * 4 + 100) - 0.5) * tw * 0.5
      p.vertex(rx + noiseAmt, ly)
    }

    p.endShape(p.CLOSE)
  }

  const makeSingleAgave = (x, y, size, shade) => {
    const [r, g, b] = shade
    const numLeaves = 9
    for (let i = 0; i < numLeaves; i++) {
      const t = i / (numLeaves - 1)
      const angle = p.lerp(p.PI * 1.1, p.PI * 1.9, t)
      const length = size * p.lerp(0.6, 1.0, Math.sin(t * p.PI))
      const leafWidth = size * 0.11
      const tipX = x + p.cos(angle) * length
      const tipY = y + p.sin(angle) * length
      const lr = r + Math.floor((i - 4) * 3)
      const lg = g + Math.floor((i - 4) * 3)
      const lb = b + Math.floor((i - 4) * 2)
      p.fill(lr, lg, lb); p.noStroke()
      p.beginShape()
      for (let nt = 0; nt <= 1; nt += 0.08) {
        let lx = p.lerp(x, tipX, nt)
        let ly = p.lerp(y, tipY, nt)
        const w = leafWidth * (1 - nt)
        const noiseAmount = (p.noise(x * 0.01 + i * 10 + nt * 5) - 0.5) * size * 0.25 * nt
        lx += -p.sin(angle) * (w + noiseAmount)
        ly += p.cos(angle) * (w + noiseAmount)
        p.vertex(lx, ly)
      }
      for (let nt = 1; nt >= 0; nt -= 0.08) {
        let lx = p.lerp(x, tipX, nt)
        let ly = p.lerp(y, tipY, nt)
        const w = leafWidth * (1 - nt)
        const noiseAmount = (p.noise(x * 0.01 + i * 10 + nt * 5 + 100) - 0.5) * size * 0.25 * nt
        lx -= -p.sin(angle) * (w + noiseAmount)
        ly -= p.cos(angle) * (w + noiseAmount)
        p.vertex(lx, ly)
      }
      p.endShape(p.CLOSE)
    }
    p.fill(r-10, g-10, b-8); p.noStroke()
    p.ellipse(x, y, size * 0.16, size * 0.16)
  }

  const makeRng = (seed) => {
    let s = seed
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 0xffffffff
    }
  }

  const generatePlants = (groundPts) => {
    const posRng = makeRng(5567)
    const styleRng = makeRng(5678)
    const cactusShades = [
      //  
      [178,190,170],[162,175,152],[144,158,133],
      [125,140,114],[108,124,97],
    ]
    const plants = []
    const used = []
    const cactusCount = Math.floor(p.width / 130)
    const agaveCount = 10

    // generate cacti
    for (let i = 0; i < cactusCount; i++) {
      let attempts = 0, cx
      do { cx = posRng() * (p.width-36) + 18; attempts++ }
      while (used.some(x => Math.abs(x-cx) < 44) && attempts < 40)
      used.push(cx)
      const gi = Math.min(Math.round(cx/3), groundPts.length-1)
      const groundY = groundPts[gi].y
      const yNudge = styleRng() * (p.height - groundY)
      const gy = groundY + yNudge
      const htRoll = styleRng()
      const ht = htRoll < 0.15 ? styleRng()*35+70 : htRoll < 0.4 ? styleRng()*10+8 : styleRng()*36+22
      const shade = cactusShades[Math.floor(styleRng() * cactusShades.length)]
      const numArms = ht > 42 ? (styleRng() > 0.4 ? 2 : 1) : ht > 28 ? (styleRng() > 0.7 ? 1 : 0) : 0
      plants.push({ type: 'cactus', cx, gy, ht, shade, numArms,
        a1side: styleRng() > 0.5 ? 1 : -1,
        a1frac: styleRng()*0.18+0.38, a1len: styleRng()*14+10,
        a2frac: styleRng()*0.18+0.32, a2len: styleRng()*12+8,
      })
    }

    // generate agave
    p.randomSeed(42)
    for (let i = 0; i < agaveCount; i++) {
      let attempts = 0, x, y
      do {
        x = p.random(p.width * 0.01, p.width * 0.99)
        y = p.random(p.height * 0.83, p.height)
        attempts++
      } while (used.some(px => Math.abs(px - x) < 35) && attempts < 40)
      used.push(x)
      const size = p.random(15, 35)
      const shade = [
        p.random(160, 185),
        p.random(175, 200),
        p.random(155, 175)
      ]
      plants.push({ type: 'agave', cx: x, gy: y, size, shade })
    }

    return plants
  }

  let mountainPointsArr = []
  let groundPoints = []
  let plants = []

  const generate = () => {
    mountainPointsArr = [
      makeMountain(9,  p.height * 0.45, p.height * 0.4, 11),
      makeMountain(11, p.height * 0.5,  p.height * 0.3, 9),
      makeMountain(12, p.height * 0.65, p.height * 0.3, 10),
    ]
      groundPoints = makeGround(99)
      plants = generatePlants(groundPoints)
  }

  p.setup = () => {
    const canvas = p.createCanvas(p.windowWidth, 115)
    canvas.parent('desert-footer')
    generate()
    p.noLoop()
  }

  p.draw = () => {
    p.background('#FAF8F3')

    const mountainColors = ['#E1DDE8', '#CDC5E1', '#B6ADD7']
    for (let i = 0; i < mountainPointsArr.length; i++) {
      p.fill(mountainColors[i]); p.noStroke()
      p.beginShape()
      for (const pt of mountainPointsArr[i]) p.vertex(pt.x, pt.y)
      p.vertex(p.width, p.height+5); p.vertex(0, p.height+5)
      p.endShape(p.CLOSE)
    }

    p.fill('#e2d7c6'); p.noStroke()
    p.beginShape()
    for (const pt of groundPoints) p.vertex(pt.x, pt.y)
    p.vertex(p.width, p.height+5); p.vertex(0, p.height+5)
    p.endShape(p.CLOSE)

    // first pass — cacti
    for (const pl of plants) {
      if (pl.type === 'cactus') {
        drawCactus(pl.cx, pl.gy, pl.ht, pl.shade, pl.numArms, pl.a1side, pl.a1frac, pl.a1len, pl.a2frac, pl.a2len)
      }
    }

    // second pass — agave always on top
    for (const pl of plants) {
      if (pl.type === 'agave') {
        makeSingleAgave(pl.cx, pl.gy, pl.size, pl.shade)
      }
    }
  }

  let resizeTimer
  p.windowResized = () => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      p.resizeCanvas(p.windowWidth, 115)
      generate()
      p.redraw()
    }, 200)
  }

}

new p5(sketch)