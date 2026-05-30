const { getAllProducts, getProductById, addProduct, updateProductById, deleteProductById } = require('../utils/productModel');

const fetchProducts = async (req, res, next) => {
  try {
    const products = await getAllProducts();
    console.log(`[API] GET /api/products — returning ${products.length} products`);
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

    console.log(`[API] PUT /api/products/${id} — received request:`, {
      name: name ? `"${name.substring(0, 30)}..."` : 'not provided',
      category,
      price,
      inventory: inventoryValue,
      description: description ? `"${description.substring(0, 30)}..."` : 'not provided',
      image_url_from_request: image_url ? `"${image_url.substring(0, 50)}..."` : 'not provided',
      imageUrl_from_request: imageUrl ? `"${imageUrl.substring(0, 50)}..."` : 'not provided',
      final_image_value: imageValue ? `"${imageValue.substring(0, 50)}..."` : 'not provided',
    });

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

    console.log(`[API] PUT /api/products/${id} — saved product:`, {
      id: updatedProduct.id,
      name: updatedProduct.name,
      image_url: updatedProduct.image_url ? `"${updatedProduct.image_url.substring(0, 50)}..."` : 'null',
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(`[API] PUT /api/products/${id} — error:`, error.message);
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
