//purple bold current page
const currentPath = window.location.pathname; 
const pages = [
  { element: document.getElementById('home'), path: '/home.html' }, 
  { element: document.getElementById('projects'), path: '/projects.html' }, 
  { element: document.getElementById('art'), path: '/art.html' }, 
  { element: document.getElementById('about'), path: '/about.html' }, 
]

pages.forEach((page) => {
  if (currentPath === page.path) page.element.classList.add('current-page')
})

//p5.js stuff
const sketch = (p) => {
  p.setup = () => {
    p.createCanvas(400, 400)
    let canvas = p.createCanvas(p.windowWidth, 150)
    canvas.parent('desert-footer')
    p.noLoop()
  }

  p.draw = () => {
    p.fill('#FAF8F3')
  }
}
 
new p5(sketch)
