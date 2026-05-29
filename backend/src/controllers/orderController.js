const { addOrder, getAllOrders, updateOrderById, deleteOrderById } = require('../utils/orderModel');

const createPublicOrder = async (req, res, next) => {
  const {
    name,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    differentAddress,
    shippingAddress,
    items,
    paymentMethod,
    subtotal,
    deliveryCharges,
    packagingCharges,
    totalAmount,
    date,
    notes,
  } = req.body;

  if (!name || !phone || !address || !city || !state || !pincode) {
    return res.status(400).json({ error: 'Please fill in all required customer details.' });
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Please select at least one product.' });
  }

  if (!date) {
    return res.status(400).json({ error: 'Please select a delivery date.' });
  }

  const orderId = `OD-${Date.now()}`;
  const order = {
    id: orderId,
    orderId,
    name,
    email: email || '',
    phone,
    address,
    city,
    state,
    pincode,
    differentAddress: Boolean(differentAddress),
    shippingAddress: shippingAddress || {
      street: address,
      city,
      state,
      postalCode: pincode,
      country: 'India',
    },
    items,
    paymentMethod: paymentMethod || 'cod',
    subtotal: Number(subtotal) || 0,
    deliveryCharges: Number(deliveryCharges) || 0,
    packagingCharges: Number(packagingCharges) || 0,
    totalAmount: Number(totalAmount) || 0,
    status: 'Completed',
    date,
    notes: notes || '',
  };

  try {
    await addOrder(order);
    return res.status(201).json({
      id: order.id,
      orderId: order.orderId,
      message: 'Order placed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const fetchOrders = async (req, res, next) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const updated = await updateOrderById(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

const removeOrder = async (req, res, next) => {
  const { id } = req.params;
  try {
    const deleted = await deleteOrderById(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createPublicOrder, fetchOrders, updateOrder, removeOrder };
