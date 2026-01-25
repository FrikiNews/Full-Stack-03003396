/* ------------------ Clase: Tarea ------------------ */
class Tarea {
  constructor(id, nombre, completada = false) {
    this.id = id;
    this.nombre = nombre;
    this.completada = completada;
  }

  toggle() {
    this.completada = !this.completada;
  }

  actualizar(nombre) {
    this.nombre = nombre;
  }
}

/* ------------------ Clase: GestorDeTareas (Almacenamiento) ------------------ */
class GestorDeTareas {
  constructor() {
    this.storageKey = 'gestor_tareas_v1';
    this.tareas = [];
    this.cargar();
  }

  agregar(nombre) {
    const id = Date.now().toString();
    const tarea = new Tarea(id, nombre, false);
    this.tareas.push(tarea);
    this.guardar();
    return tarea;
  }

  editar(id, nuevoNombre) {
    const t = this.tareas.find(x => x.id === id);
    if (t) {
      t.actualizar(nuevoNombre);
      this.guardar();
    }
  }

  eliminar(id) {
    this.tareas = this.tareas.filter(x => x.id !== id);
    this.guardar();
  }

  alternar(id) {
    const t = this.tareas.find(x => x.id === id);
    if (t) {
      t.toggle();
      this.guardar();
    }
  }

  guardar() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.tareas));
  }

  cargar() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        this.tareas = arr.map(o => new Tarea(o.id, o.nombre, !!o.completada));
      } catch (e) {
        this.tareas = [];
      }
    }
  }
}

/* ------------------ DOM: Selectores y elementos ------------------ */
const input = document.getElementById('entrada-tarea');
const addBtn = document.getElementById('btn-agregar-tarea');
const list = document.getElementById('lista-tareas');
const errorMsg = document.getElementById('mensaje-error');

/* ------------------ Instancia del gestor ------------------ */
const gestor = new GestorDeTareas();

/* ------------------ Helpers: Mensajes ------------------ */
const mostrarError = msg => {
  errorMsg.textContent = msg;
  setTimeout(() => { if (errorMsg.textContent === msg) errorMsg.textContent = ''; }, 2500);
};

/* ------------------ Render: construye la lista en el DOM ------------------ */
const render = () => {
  list.innerHTML = '';
  gestor.tareas.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (t.completada) li.classList.add('completed');
    li.dataset.id = t.id;

    li.innerHTML = `
      <div class="left">
        <span class="task-name">${t.nombre}</span>
      </div>
      <div class="actions">
        <button class="edit">Editar</button>
        <button class="delete">Eliminar</button>
      </div>
    `;

    list.appendChild(li);
  });
};

/* ------------------ Event: Agregar tarea (click) ------------------ */
addBtn.addEventListener('click', () => {
  const val = input.value.trim();
  if (!val) {
    mostrarError('La tarea no puede estar vacía');
    return;
  }
  gestor.agregar(val);
  input.value = '';
  render();
});

/* ------------------ Event: Permitir Enter en input ------------------ */
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') addBtn.click();
});

/* ------------------ Delegación: clicks en la lista (editar, eliminar, toggle) ------------------ */
list.addEventListener('click', e => {
  const target = e.target;
  const li = target.closest('li');
  if (!li) return;
  const id = li.dataset.id;

  // Si se clicó dentro del área de acciones o sobre un input de edición, manejar acciones específicas
  if (target.closest('.actions')) {
    if (target.classList.contains('delete')) {
      if (confirm('¿Eliminar esta tarea?')) {
        gestor.eliminar(id);
        render();
      }
      return;
    }

    if (target.classList.contains('edit')) {
      const span = li.querySelector('.task-name');
      const current = span.textContent;
      const inputEdit = document.createElement('input');
      inputEdit.type = 'text';
      inputEdit.value = current;
      inputEdit.className = 'edit-input';
      span.replaceWith(inputEdit);
      target.textContent = 'Guardar';
      target.classList.remove('edit');
      target.classList.add('save');
      inputEdit.focus();
      return;
    }

    if (target.classList.contains('save')) {
      const inputEdit = li.querySelector('.edit-input');
      if (!inputEdit) return;
      const nuevo = inputEdit.value.trim();
      if (!nuevo) {
        mostrarError('El nombre no puede quedar vacío');
        return;
      }
      gestor.editar(id, nuevo);
      render();
      return;
    }

    return; // cualquier otro click dentro de .actions no debe alternar estado
  }

  // Si clic fuera de botones/inputs, alternar completado en la tarea (clic en la card)
  if (target.classList.contains('edit-input')) return;
  gestor.alternar(id);
  render();
});

/* ------------------ Delegación: cambios (checkboxes u otros) ------------------ */
list.addEventListener('change', e => {
  if (e.target.classList.contains('toggle')) {
    const li = e.target.closest('li');
    if (!li) return;
    gestor.alternar(li.dataset.id);
    render();
  }
});

/* ------------------ Render inicial ------------------ */
render();