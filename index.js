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

