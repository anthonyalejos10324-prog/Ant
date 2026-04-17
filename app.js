const STORAGE_KEY = 'multimodalPortfolioSlides';
const canvas = document.getElementById('slide-canvas');
const slideList = document.getElementById('slide-list');
const addTextBtn = document.getElementById('add-text-btn');
const addImageBtn = document.getElementById('add-image-btn');
const imageInput = document.getElementById('image-input');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const deleteBtn = document.getElementById('delete-btn');
const backgroundInput = document.getElementById('background-color-input');
const textColorInput = document.getElementById('text-color-input');
const fontSizeSelect = document.getElementById('font-size-select');

let slides = loadSlides();
let currentSlideIndex = 0;
let selectedElementId = null;
let dragState = null;

function makeId(prefix = 'el') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function defaultSlides() {
  return [
    {
      id: 'slide-cover',
      title: 'Cover',
      background: '#ffffff',
      elements: [
        {
          id: makeId(),
          type: 'text',
          x: 140,
          y: 110,
          width: 700,
          height: 80,
          html: '<h1>My Multimodal Portfolio</h1>',
          style: { color: '#111111', fontSize: '46px' }
        },
        {
          id: makeId(),
          type: 'text',
          x: 170,
          y: 220,
          width: 620,
          height: 70,
          html: '<p>Name • Class • Instructor</p>',
          style: { color: '#3a4050', fontSize: '28px' }
        }
      ]
    },
    {
      id: 'slide-essay-1',
      title: 'Essay 1',
      background: '#ffffff',
      elements: [
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 80,
          width: 760,
          height: 80,
          html: '<h2>Essay 1</h2>',
          style: { color: '#111111', fontSize: '42px' }
        },
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 190,
          width: 760,
          height: 140,
          html: '<p>Click to write your first essay reflection, evidence, or multimodal caption.</p>',
          style: { color: '#202633', fontSize: '20px' }
        }
      ]
    },
    {
      id: 'slide-essay-2',
      title: 'Essay 2',
      background: '#ffffff',
      elements: [
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 80,
          width: 760,
          height: 80,
          html: '<h2>Essay 2</h2>',
          style: { color: '#111111', fontSize: '42px' }
        },
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 190,
          width: 760,
          height: 140,
          html: '<p>Add your second essay analysis here and drag in media.</p>',
          style: { color: '#202633', fontSize: '20px' }
        }
      ]
    },
    {
      id: 'slide-essay-3',
      title: 'Essay 3',
      background: '#ffffff',
      elements: [
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 80,
          width: 760,
          height: 80,
          html: '<h2>Essay 3</h2>',
          style: { color: '#111111', fontSize: '42px' }
        },
        {
          id: makeId(),
          type: 'text',
          x: 90,
          y: 190,
          width: 760,
          height: 140,
          html: '<p>Use this slide for your final essay and supporting visuals.</p>',
          style: { color: '#202633', fontSize: '20px' }
        }
      ]
    }
  ];
}

function loadSlides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSlides();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 4) return defaultSlides();
    return parsed;
  } catch (error) {
    return defaultSlides();
  }
}

function saveSlides() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
}

function getCurrentSlide() {
  return slides[currentSlideIndex];
}

function renderSlideList() {
  slideList.innerHTML = '';
  slides.forEach((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `slide-tab ${index === currentSlideIndex ? 'active' : ''}`;
    button.innerHTML = `<strong>${index + 1}. ${slide.title}</strong><small>${slide.elements.length} element(s)</small>`;
    button.addEventListener('click', () => {
      currentSlideIndex = index;
      selectedElementId = null;
      render();
    });
    slideList.appendChild(button);
  });
}

function applyElementStyle(node, style = {}) {
  if (style.color) node.style.color = style.color;
  if (style.fontSize) node.style.fontSize = style.fontSize;
}

function clampElementBounds(element, slideWidth, slideHeight) {
  element.width = Math.max(80, Math.min(element.width, slideWidth));
  element.height = Math.max(40, Math.min(element.height, slideHeight));
  element.x = Math.max(0, Math.min(element.x, slideWidth - element.width));
  element.y = Math.max(0, Math.min(element.y, slideHeight - element.height));
}

function renderCanvas() {
  const slide = getCurrentSlide();
  canvas.style.background = slide.background || '#ffffff';
  backgroundInput.value = slide.background || '#ffffff';
  canvas.innerHTML = '';

  const canvasRect = canvas.getBoundingClientRect();
  const slideWidth = canvasRect.width;
  const slideHeight = canvasRect.height;

  slide.elements.forEach((element) => {
    clampElementBounds(element, slideWidth, slideHeight);

    const wrapper = document.createElement('div');
    wrapper.className = `slide-element ${selectedElementId === element.id ? 'selected' : ''}`;
    wrapper.dataset.elementId = element.id;
    wrapper.style.left = `${element.x}px`;
    wrapper.style.top = `${element.y}px`;
    wrapper.style.width = `${element.width}px`;
    wrapper.style.height = `${element.height}px`;

    const content = element.type === 'image' ? document.createElement('img') : document.createElement('div');
    content.className = 'content';

    if (element.type === 'image') {
      content.src = element.src;
      content.alt = 'Slide image';
      content.draggable = false;
    } else {
      content.contentEditable = 'true';
      content.innerHTML = element.html;
      applyElementStyle(content, element.style);
      content.addEventListener('input', () => {
        element.html = content.innerHTML;
        saveSlides();
      });
      content.addEventListener('focus', () => {
        selectedElementId = element.id;
        deleteBtn.disabled = false;
        wrapper.classList.add('selected');
      });
    }

    wrapper.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest('.resize-handle');
      const moveHandle = event.target.closest('.move-handle');
      const targetIsEditableContent = event.target === content && element.type === 'text';

      selectedElementId = element.id;
      deleteBtn.disabled = false;
      renderCanvas();

      if (handle) {
        startResize(event, element.id, handle.dataset.direction);
      } else if (moveHandle || !targetIsEditableContent || element.type === 'image') {
        startDrag(event, element.id);
      }
    });

    wrapper.appendChild(content);

    const moveHandle = document.createElement('span');
    moveHandle.className = 'move-handle';
    moveHandle.title = 'Drag element';
    wrapper.appendChild(moveHandle);

    ['nw', 'ne', 'sw', 'se'].forEach((direction) => {
      const handle = document.createElement('span');
      handle.className = `resize-handle ${direction}`;
      handle.dataset.direction = direction;
      wrapper.appendChild(handle);
    });

    canvas.appendChild(wrapper);
  });

  deleteBtn.disabled = !selectedElementId;
}

function render() {
  renderSlideList();
  renderCanvas();
}

function getElementById(elementId) {
  return getCurrentSlide().elements.find((item) => item.id === elementId);
}

function startDrag(event, elementId) {
  event.preventDefault();
  const element = getElementById(elementId);
  if (!element) return;

  dragState = {
    mode: 'move',
    elementId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: element.x,
    startTop: element.y
  };
}

function startResize(event, elementId, direction) {
  event.preventDefault();
  const element = getElementById(elementId);
  if (!element) return;

  dragState = {
    mode: 'resize',
    direction,
    elementId,
    startX: event.clientX,
    startY: event.clientY,
    startLeft: element.x,
    startTop: element.y,
    startWidth: element.width,
    startHeight: element.height
  };
}

function pointerMove(event) {
  if (!dragState) return;
  const element = getElementById(dragState.elementId);
  if (!element) return;

  const dx = event.clientX - dragState.startX;
  const dy = event.clientY - dragState.startY;

  if (dragState.mode === 'move') {
    element.x = dragState.startLeft + dx;
    element.y = dragState.startTop + dy;
  } else {
    const minWidth = 80;
    const minHeight = 40;

    if (dragState.direction.includes('e')) {
      element.width = Math.max(minWidth, dragState.startWidth + dx);
    }
    if (dragState.direction.includes('s')) {
      element.height = Math.max(minHeight, dragState.startHeight + dy);
    }
    if (dragState.direction.includes('w')) {
      const nextWidth = Math.max(minWidth, dragState.startWidth - dx);
      const widthDiff = nextWidth - dragState.startWidth;
      element.width = nextWidth;
      element.x = dragState.startLeft - widthDiff;
    }
    if (dragState.direction.includes('n')) {
      const nextHeight = Math.max(minHeight, dragState.startHeight - dy);
      const heightDiff = nextHeight - dragState.startHeight;
      element.height = nextHeight;
      element.y = dragState.startTop - heightDiff;
    }
  }

  const rect = canvas.getBoundingClientRect();
  clampElementBounds(element, rect.width, rect.height);
  renderCanvas();
}

function pointerUp() {
  if (!dragState) return;
  dragState = null;
  saveSlides();
}

function addTextElement() {
  const slide = getCurrentSlide();
  slide.elements.push({
    id: makeId(),
    type: 'text',
    x: 120,
    y: 120,
    width: 280,
    height: 120,
    html: '<p>New text box</p>',
    style: { color: '#111111', fontSize: '16px' }
  });
  saveSlides();
  render();
}

function addImageElement(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const slide = getCurrentSlide();
    slide.elements.push({
      id: makeId(),
      type: 'image',
      x: 130,
      y: 140,
      width: 300,
      height: 220,
      src: reader.result
    });
    saveSlides();
    render();
  };
  reader.readAsDataURL(file);
}

function applyTextCommand(command, value = null) {
  document.execCommand(command, false, value);
  const selected = getElementById(selectedElementId);
  if (selected && selected.type === 'text') {
    const node = canvas.querySelector(`[data-element-id="${selectedElementId}"] .content`);
    selected.html = node ? node.innerHTML : selected.html;
    saveSlides();
  }
}

function setTextStyle(property, value) {
  const selected = getElementById(selectedElementId);
  if (!selected || selected.type !== 'text') return;
  selected.style = selected.style || {};
  selected.style[property] = value;
  saveSlides();
  renderCanvas();
}

function deleteSelectedElement() {
  const slide = getCurrentSlide();
  if (!selectedElementId) return;
  slide.elements = slide.elements.filter((item) => item.id !== selectedElementId);
  selectedElementId = null;
  saveSlides();
  render();
}

function exportSlides() {
  const exportData = JSON.stringify(slides);
  const escapedData = exportData.replace(/</g, '\\u003c');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported Portfolio</title>
<style>
  body{margin:0;font-family:Arial,sans-serif;background:#f3f5f9;color:#172033}
  .wrap{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
  .nav{background:#fff;border-right:1px solid #dbe2ef;padding:1rem}
  .nav button{display:block;width:100%;text-align:left;border:1px solid #dbe2ef;background:#fff;border-radius:10px;padding:0.6rem;margin-bottom:0.5rem;cursor:pointer}
  .nav button.active{border-color:#4d67ff;box-shadow:0 0 0 2px rgba(77,103,255,.18)}
  .stage{padding:1rem}
  .slide{position:relative;height:calc(100vh - 2rem);background:#fff;border-radius:14px;box-shadow:0 8px 30px rgba(10,20,40,.1);overflow:hidden}
  .el{position:absolute}
  .el img{width:100%;height:100%;object-fit:contain}
</style>
</head>
<body>
<div class="wrap">
  <aside class="nav" id="nav"></aside>
  <main class="stage"><section id="slide" class="slide"></section></main>
</div>
<script>
  const slides = ${escapedData};
  const nav = document.getElementById('nav');
  const slide = document.getElementById('slide');
  let current = 0;
  function renderNav(){
    nav.innerHTML='';
    slides.forEach((s,i)=>{
      const b=document.createElement('button');
      b.className=i===current?'active':'';
      b.textContent=(i+1)+'. '+s.title;
      b.onclick=()=>{current=i;render();};
      nav.appendChild(b);
    });
  }
  function render(){
    renderNav();
    const s=slides[current];
    slide.style.background=s.background||'#fff';
    slide.innerHTML='';
    s.elements.forEach((e)=>{
      const node=document.createElement('div');
      node.className='el';
      node.style.left=e.x+'px';node.style.top=e.y+'px';node.style.width=e.width+'px';node.style.height=e.height+'px';
      if(e.type==='image'){
        const img=document.createElement('img');img.src=e.src;img.alt='Slide image';node.appendChild(img);
      }else{
        node.innerHTML=e.html;
        if(e.style){if(e.style.color){node.style.color=e.style.color;}if(e.style.fontSize){node.style.fontSize=e.style.fontSize;}}
      }
      slide.appendChild(node);
    });
  }
  render();
</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'portfolio-export.html';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

canvas.addEventListener('click', (event) => {
  if (!event.target.closest('.slide-element')) {
    selectedElementId = null;
    deleteBtn.disabled = true;
    renderCanvas();
  }
});

addTextBtn.addEventListener('click', addTextElement);
addImageBtn.addEventListener('click', () => imageInput.click());
imageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) addImageElement(file);
  imageInput.value = '';
});

saveBtn.addEventListener('click', saveSlides);
exportBtn.addEventListener('click', exportSlides);
deleteBtn.addEventListener('click', deleteSelectedElement);

backgroundInput.addEventListener('input', () => {
  const slide = getCurrentSlide();
  slide.background = backgroundInput.value;
  saveSlides();
  renderCanvas();
});

textColorInput.addEventListener('input', () => {
  setTextStyle('color', textColorInput.value);
});

fontSizeSelect.addEventListener('change', () => {
  setTextStyle('fontSize', `${fontSizeSelect.value}px`);
});

document.getElementById('bold-btn').addEventListener('click', () => applyTextCommand('bold'));
document.getElementById('italic-btn').addEventListener('click', () => applyTextCommand('italic'));
document.getElementById('underline-btn').addEventListener('click', () => applyTextCommand('underline'));

document.addEventListener('keydown', (event) => {
  if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElementId) {
    const activeTag = document.activeElement && document.activeElement.tagName;
    const isEditingText = document.activeElement && document.activeElement.isContentEditable;
    if (!isEditingText && activeTag !== 'INPUT' && activeTag !== 'TEXTAREA' && activeTag !== 'SELECT') {
      event.preventDefault();
      deleteSelectedElement();
    }
  }
});

window.addEventListener('pointermove', pointerMove);
window.addEventListener('pointerup', pointerUp);
window.addEventListener('beforeunload', saveSlides);
window.addEventListener('resize', renderCanvas);

setInterval(saveSlides, 3000);
render();
