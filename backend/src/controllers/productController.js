const { getAllProducts, getProductById, addProduct, updateProductById, deleteProductById } = require('../utils/productModel');

const fetchProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

const fetchProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, inventory, stock, description, image_url, imageUrl } = req.body;
    const imageValue = image_url || imageUrl || null;
    const inventoryValue = inventory ?? stock ?? 0;

    if (!name || !category || !price) {
      return res.status(400).json({ error: 'Name, category, and price are required.' });
    }

    const newProduct = await addProduct({
      name,
      category,
      price,
      inventory: inventoryValue,
      description,
      imageUrl: imageValue,
    });
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, inventory, stock, description, image_url, imageUrl } = req.body;
    const imageValue = image_url || imageUrl;
    const inventoryValue = inventory ?? stock;

    if (name == null && category == null && price == null && inventoryValue == null && description == null && imageValue == null) {
      return res.status(400).json({ error: 'At least one field must be provided.' });
    }

    const updatedProduct = await updateProductById(id, {
      name,
      category,
      price,
      inventory: inventoryValue,
      description,
      imageUrl: imageValue,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteProductById(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { fetchProducts, fetchProductById, createProduct, updateProduct, deleteProduct };
