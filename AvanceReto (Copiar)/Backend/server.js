const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

function asyncHandler(fn) {
  return function asyncUtilWrap(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

const vehicleSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1900 },
    plate: { type: String, required: true, trim: true, unique: true },
  },
  { timestamps: true, collection: "vehiculos" }
);

const serviceSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehiculo",
      required: true,
    },
    serviceType: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true },
    cost: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: "servicios" }
);

const Vehiculo = mongoose.model("Vehiculo", vehicleSchema);
const Servicio = mongoose.model("Servicio", serviceSchema);

function notFound(req, res, next) {
  res.status(404);
  res.json({ message: "Ruta no encontrada" });
}

function errorHandler(err, req, res, next) {
  if (err && err.name === "ValidationError") {
    res.status(400);
    return res.json({ message: err.message || "Error de validacion" });
  }

  if (err && err.code === 11000) {
    res.status(400);
    return res.json({ message: "Dato duplicado" });
  }

  const status = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(status);
  res.json({ message: err.message || "Error del servidor" });
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "..", "Frontend")));

app.get(
  "/api/vehiculos",
  asyncHandler(async (req, res) => {
    const vehicles = await Vehiculo.find().sort({ createdAt: -1 });
    res.json(vehicles);
  })
);

app.post(
  "/api/vehiculos",
  asyncHandler(async (req, res) => {
    const { brand, model, year, plate } = req.body;

    if (!brand || !model || !year || !plate) {
      res.status(400);
      throw new Error("Faltan campos obligatorios");
    }

    const vehicle = await Vehiculo.create({ brand, model, year, plate });
    res.status(201).json(vehicle);
  })
);

app.get(
  "/api/vehiculos/:id",
  asyncHandler(async (req, res) => {
    const vehicle = await Vehiculo.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehiculo no encontrado");
    }

    res.json(vehicle);
  })
);

app.put(
  "/api/vehiculos/:id",
  asyncHandler(async (req, res) => {
    const { brand, model, year, plate } = req.body;

    const vehicle = await Vehiculo.findByIdAndUpdate(
      req.params.id,
      { brand, model, year, plate },
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehiculo no encontrado");
    }

    res.json(vehicle);
  })
);

app.delete(
  "/api/vehiculos/:id",
  asyncHandler(async (req, res) => {
    const vehicle = await Vehiculo.findById(req.params.id);

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehiculo no encontrado");
    }

    try {
      await Servicio.deleteMany({ vehicleId: req.params.id });
    } catch (error) {
      res.status(500);
      throw new Error("Error eliminando servicios");
    }

    await Vehiculo.findByIdAndDelete(req.params.id);

    res.json({ message: "Vehiculo eliminado" });
  })
);

app.get(
  "/api/vehiculos/:id/servicios",
  asyncHandler(async (req, res) => {
    const services = await Servicio.find({ vehicleId: req.params.id }).sort({
      date: -1,
    });
    res.json(services);
  })
);

app.post(
  "/api/vehiculos/:id/servicios",
  asyncHandler(async (req, res) => {
    const { serviceType, date, description, cost } = req.body;

    if (!serviceType || !date || cost === undefined) {
      res.status(400);
      throw new Error("Faltan campos obligatorios");
    }

    const service = await Servicio.create({
      vehicleId: req.params.id,
      serviceType,
      date,
      description,
      cost,
    });

    res.status(201).json(service);
  })
);

app.put(
  "/api/vehiculos/:id/servicios/:serviceId",
  asyncHandler(async (req, res) => {
    const { serviceType, date, description, cost } = req.body;

    const service = await Servicio.findOneAndUpdate(
      { _id: req.params.serviceId, vehicleId: req.params.id },
      { serviceType, date, description, cost },
      { new: true, runValidators: true }
    );

    if (!service) {
      res.status(404);
      throw new Error("Servicio no encontrado");
    }

    res.json(service);
  })
);

app.delete(
  "/api/vehiculos/:id/servicios/:serviceId",
  asyncHandler(async (req, res) => {
    const service = await Servicio.findOneAndDelete({
      _id: req.params.serviceId,
      vehicleId: req.params.id,
    });

    if (!service) {
      res.status(404);
      throw new Error("Servicio no encontrado");
    }

    res.json({ message: "Servicio eliminado" });
  })
);

app.get(
  "/api/servicios",
  asyncHandler(async (req, res) => {
    const services = await Servicio.find().sort({ date: -1 });
    res.json(services);
  })
);

app.use(notFound);
app.use(errorHandler);

const port = 3000;
const mongoUri = "mongodb://localhost:27017/FullStack";

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Open: http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  });