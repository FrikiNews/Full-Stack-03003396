const Book = require('../models/Book');

const getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener libros' });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    return res.json(book);
  } catch (error) {
    return res.status(400).json({ message: 'ID de libro invalido' });
  }
};

const createBook = async (req, res) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error al crear libro' });
  }
};

const updateBook = async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedBook) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    return res.json(updatedBook);
  } catch (error) {
    return res.status(400).json({ message: error.message || 'Error al actualizar libro' });
  }
};

const deleteBook = async (req, res) => {
  try {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
      return res.status(404).json({ message: 'Libro no encontrado' });
    }

    return res.json({ message: 'Libro eliminado correctamente' });
  } catch (error) {
    return res.status(400).json({ message: 'ID de libro invalido' });
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
