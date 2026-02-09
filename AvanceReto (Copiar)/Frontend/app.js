const API_BASE = "http://localhost:3000/api";
const VEHICLE_URL = `${API_BASE}/vehiculos`;
const SERVICE_URL = `${API_BASE}/servicios`;

const vehicleForm = document.getElementById("vehicle-form");
const vehicleList = document.getElementById("vehicle-list");
const vehicleCancel = document.getElementById("vehicle-cancel");

const serviceForm = document.getElementById("service-form");
const serviceList = document.getElementById("service-list");
const serviceHint = document.getElementById("service-hint");
const serviceCancel = document.getElementById("service-cancel");

let selectedVehicleId = null;
let vehiclesCache = [];
let servicesCache = [];

function setServiceFormEnabled(enabled) {
  serviceForm.querySelectorAll("input, textarea, button").forEach((el) => {
    el.disabled = !enabled;
  });
  serviceForm.setAttribute("aria-disabled", String(!enabled));
}

function resetVehicleForm() {
  document.getElementById("vehicle-id").value = "";
  vehicleForm.reset();
}

function resetServiceForm() {
  document.getElementById("service-id").value = "";
  serviceForm.reset();
}

async function loadVehicles() {
  try {
    const response = await fetch(VEHICLE_URL);
    if (!response.ok) throw new Error("Error cargando vehiculos");
    vehiclesCache = await response.json();
    renderVehicles(vehiclesCache);
  } catch (err) {
    vehicleList.innerHTML = "Error cargando vehiculos.";
    console.error(err);
  }
}

function renderVehicles(vehicles) {
  vehicleList.innerHTML = "";

  if (vehicles.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Sin vehiculos registrados";
    empty.classList.add("muted");
    vehicleList.appendChild(empty);
    return;
  }

  vehicles.forEach((vehicle) => {
    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${vehicle.brand} ${vehicle.model}</strong>
      <span class="badge">${vehicle.plate}</span>
      <span class="muted">Año ${vehicle.year}</span>
      <div class="actions">
        <button class="select-btn" data-id="${vehicle._id}">Ver servicios</button>
        <button class="edit-btn ghost" data-id="${vehicle._id}">Editar</button>
        <button class="delete-btn ghost" data-id="${vehicle._id}">Eliminar</button>
      </div>
    `;
    vehicleList.appendChild(item);
  });
}

async function loadServices() {
  if (!selectedVehicleId) return;
  try {
    const response = await fetch(`${VEHICLE_URL}/${selectedVehicleId}/servicios`);
    if (!response.ok) throw new Error("Error cargando servicios");
    servicesCache = await response.json();
    renderServices(servicesCache);
  } catch (err) {
    serviceList.innerHTML = "Error cargando servicios.";
    console.error(err);
  }
}

async function loadAllServices() {
  try {
    const response = await fetch(SERVICE_URL);
    if (!response.ok) throw new Error("Error cargando servicios");
    servicesCache = await response.json();
    renderServices(servicesCache);
  } catch (err) {
    serviceList.innerHTML = "Error cargando servicios.";
    console.error(err);
  }
}

function renderServices(services) {
  serviceList.innerHTML = "";

  if (services.length === 0) {
    const empty = document.createElement("li");
    empty.textContent = "Sin servicios registrados";
    empty.classList.add("muted");
    serviceList.appendChild(empty);
    return;
  }

  services.forEach((service) => {
    const item = document.createElement("li");
    const dateLabel = new Date(service.date).toLocaleDateString();
    item.innerHTML = `
      <strong>${service.serviceType}</strong>
      <span class="muted">${dateLabel}</span>
      <span>${service.description || "Sin descripcion"}</span>
      <span class="badge">$${Number(service.cost).toFixed(2)}</span>
      <div class="actions">
        <button class="service-edit-btn ghost" data-id="${service._id}">Editar</button>
        <button class="service-delete-btn ghost" data-id="${service._id}">Eliminar</button>
      </div>
    `;
    serviceList.appendChild(item);
  });
}

vehicleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    brand: document.getElementById("brand").value.trim(),
    model: document.getElementById("model").value.trim(),
    year: Number(document.getElementById("year").value),
    plate: document.getElementById("plate").value.trim(),
  };

  if (!payload.brand || !payload.model || !payload.plate || !payload.year) return;

  try {
    const response = await fetch(VEHICLE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Error creando vehiculo");
    resetVehicleForm();
    loadVehicles();
  } catch (err) {
    console.error(err);
    alert("No se pudo crear el vehiculo");
  }
});

vehicleCancel.addEventListener("click", () => {
  resetVehicleForm();
});

serviceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!selectedVehicleId) return;

  const payload = {
    serviceType: document.getElementById("service-type").value.trim(),
    date: document.getElementById("service-date").value,
    description: document.getElementById("service-description").value.trim(),
    cost: Number(document.getElementById("service-cost").value),
  };

  if (!payload.serviceType || !payload.date || Number.isNaN(payload.cost)) return;

  try {
    const response = await fetch(
      `${VEHICLE_URL}/${selectedVehicleId}/servicios`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) throw new Error("Error creando servicio");
    resetServiceForm();
    loadServices();
  } catch (err) {
    console.error(err);
    alert("No se pudo crear el servicio");
  }
});

serviceCancel.addEventListener("click", () => {
  resetServiceForm();
});

vehicleList.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  if (button.classList.contains("select-btn")) {
    const vehicle = vehiclesCache.find((item) => item._id === id);
    selectedVehicleId = id;
    serviceHint.textContent = vehicle
      ? `Servicios para ${vehicle.brand} ${vehicle.model}`
      : "Servicios";
    setServiceFormEnabled(true);
    resetServiceForm();
    loadServices();
    return;
  }

  if (button.classList.contains("delete-btn")) {
    if (!confirm("Eliminar este vehiculo?")) return;
    try {
      const response = await fetch(`${VEHICLE_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Error eliminando vehiculo");
      if (selectedVehicleId === id) {
        selectedVehicleId = null;
        serviceHint.textContent = "Servicios (todos)";
        setServiceFormEnabled(false);
        loadAllServices();
      }
      loadVehicles();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el vehiculo");
    }
    return;
  }

  if (button.classList.contains("edit-btn")) {
    const vehicle = vehiclesCache.find((item) => item._id === id);
    if (!vehicle) return;

    const brand = prompt("Marca:", vehicle.brand);
    if (brand === null) return;
    const model = prompt("Modelo:", vehicle.model);
    if (model === null) return;
    const year = prompt("Año:", String(vehicle.year));
    if (year === null) return;
    const plate = prompt("Placa:", vehicle.plate);
    if (plate === null) return;

    try {
      const response = await fetch(`${VEHICLE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          plate: plate.trim(),
        }),
      });
      if (!response.ok) throw new Error("Error actualizando vehiculo");
      loadVehicles();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el vehiculo");
    }
  }
});

serviceList.addEventListener("click", async (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;
  if (!id) return;

  if (button.classList.contains("service-delete-btn")) {
    if (!confirm("Eliminar este servicio?")) return;
    const service = servicesCache.find((item) => item._id === id);
    const targetVehicleId = selectedVehicleId || (service && service.vehicleId);
    if (!targetVehicleId) return;
    try {
      const response = await fetch(
        `${VEHICLE_URL}/${targetVehicleId}/servicios/${id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Error eliminando servicio");
      if (selectedVehicleId) {
        loadServices();
      } else {
        loadAllServices();
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el servicio");
    }
    return;
  }

  if (button.classList.contains("service-edit-btn")) {
    const service = servicesCache.find((item) => item._id === id);
    if (!service) return;
    const targetVehicleId = selectedVehicleId || service.vehicleId;
    if (!targetVehicleId) return;

    const serviceType = prompt("Tipo de servicio:", service.serviceType);
    if (serviceType === null) return;
    const dateValue = service.date ? service.date.slice(0, 10) : "";
    const date = prompt("Fecha (YYYY-MM-DD):", dateValue);
    if (date === null) return;
    const description = prompt("Descripcion:", service.description || "");
    if (description === null) return;
    const cost = prompt("Costo:", String(service.cost));
    if (cost === null) return;

    try {
      const response = await fetch(
        `${VEHICLE_URL}/${targetVehicleId}/servicios/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceType: serviceType.trim(),
            date: date.trim(),
            description: description.trim(),
            cost: Number(cost),
          }),
        }
      );
      if (!response.ok) throw new Error("Error actualizando servicio");
      if (selectedVehicleId) {
        loadServices();
      } else {
        loadAllServices();
      }
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el servicio");
    }
  }
});

setServiceFormEnabled(false);
serviceHint.textContent = "Servicios (todos)";
loadVehicles();
loadAllServices();
