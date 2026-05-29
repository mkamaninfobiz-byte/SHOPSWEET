import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react';
import api from '../api/axiosConfig';
import { fetchProducts } from '../api/products';
import { getProductImageUrl, mapCatalogProduct, normalizeProductList } from '../utils/productHelpers';

const DELIVERY_CHARGE = 40;
const PACKAGING_CHARGE = 20;
const NOTES_MAX = 200;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata',
  'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Patna',
  'Surat', 'Vadodara', 'Chandigarh', 'Dehradun', 'Other',
];

const defaultProductImage =
  'https://images.unsplash.com/photo-1606313564200-e75d5e304d0e?auto=format&fit=crop&w=200&q=80';

const formatRupee = (amount) =>
  `₹ ${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const OrderBookingPage = () => {
  const [searchParams] = useSearchParams();
  const productFromUrl = searchParams.get('product');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    differentAddress: false,
    productId: '',
    quantity: 1,
    date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingProducts(true);
      try {
        const data = await fetchProducts();
        const list = normalizeProductList(data).map(mapCatalogProduct);
        setProducts(list);
        if (list.length > 0) {
          const matched = productFromUrl
            ? list.find((p) => String(p.id) === String(productFromUrl))
            : null;
          setForm((prev) => ({
            ...prev,
            productId: String(matched?.id ?? list[0].id),
          }));
        }
      } catch {
        setProducts([
          {
            id: 'demo-1',
            name: 'Motichoor Ladoo',
            price: 450,
            description: '500g',
            image_url: defaultProductImage,
          },
        ]);
        setForm((prev) => ({ ...prev, productId: 'demo-1' }));
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [productFromUrl]);

  useEffect(() => {
    if (!productFromUrl || products.length === 0) return;
    const matched = products.find((p) => String(p.id) === String(productFromUrl));
    if (matched) {
      setForm((prev) => ({ ...prev, productId: String(matched.id) }));
    }
  }, [productFromUrl, products]);

  const selectedProduct = useMemo(() => {
    return products.find((p) => String(p.id) === String(form.productId)) || products[0];
  }, [products, form.productId]);

  const unitPrice = Number(selectedProduct?.price) || 0;
  const qty = Math.max(1, Number(form.quantity) || 1);
  const subtotal = unitPrice * qty;
  const total = subtotal + DELIVERY_CHARGE + PACKAGING_CHARGE;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const adjustQuantity = (delta) => {
    setForm((prev) => ({
      ...prev,
      quantity: Math.max(1, (Number(prev.quantity) || 1) + delta),
    }));
  };

  const handleNotesChange = (value) => {
    if (value.length <= NOTES_MAX) {
      updateField('notes', value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(null);

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill all required fields marked with *.');
      return;
    }
    if (!form.city || !form.state || !form.pincode.trim()) {
      setError('City, state and pincode are required.');
      return;
    }
    if (!form.date) {
      setError('Please select a delivery date.');
      return;
    }
    if (!selectedProduct) {
      setError('Please select a product.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/orders/public', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city,
        state: form.state,
        pincode: form.pincode.trim(),
        differentAddress: form.differentAddress,
        shippingAddress: {
          street: form.address.trim(),
          city: form.city,
          state: form.state,
          postalCode: form.pincode.trim(),
          country: 'India',
        },
        items: [
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            quantity: qty,
            unit_price: unitPrice,
            weight: selectedProduct.description || selectedProduct.category || '',
          },
        ],
        paymentMethod: 'cod',
        subtotal,
        deliveryCharges: DELIVERY_CHARGE,
        packagingCharges: PACKAGING_CHARGE,
        totalAmount: total,
        date: form.date,
        notes: form.notes.trim(),
      });

      setSuccess({
        orderId: response.data.orderId || response.data.id,
        total,
      });
      setForm({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        differentAddress: false,
        productId: products[0] ? String(products[0].id) : '',
        quantity: 1,
        date: '',
        notes: '',
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.error || err?.message || 'Unable to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const productImage = selectedProduct
    ? getProductImageUrl(selectedProduct)
    : defaultProductImage;

  const selectProduct = (productId) => {
    updateField('productId', String(productId));
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <ShoppingBag className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Place Your Order</h1>
              <p className="mt-1 text-sm text-slate-500">
                Fill in your details and we&apos;ll deliver fresh sweets to your doorstep
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <p className="font-semibold">Order placed successfully!</p>
            <p className="mt-1">
              Order ID: <span className="font-bold">{success.orderId}</span> · Total:{' '}
              {formatRupee(success.total)}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-slate-900">Customer Details</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Full Name <span className="text-rose-500">*</span>
                  </span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Phone Number <span className="text-rose-500">*</span>
                  </span>
                  <div className="relative mt-2">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email Address</span>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Delivery Address <span className="text-rose-500">*</span>
                  </span>
                  <div className="relative mt-2">
                    <MapPin className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      required
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="House no., Street, Area"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    City <span className="text-rose-500">*</span>
                  </span>
                  <select
                    required
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">Select City</option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    State <span className="text-rose-500">*</span>
                  </span>
                  <select
                    required
                    value={form.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Pincode <span className="text-rose-500">*</span>
                  </span>
                  <input
                    required
                    value={form.pincode}
                    onChange={(e) => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    className="mt-2 w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                </label>

                <label className="flex cursor-pointer items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={form.differentAddress}
                    onChange={(e) => updateField('differentAddress', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                  />
                  <span className="text-sm text-slate-600">Deliver to a different address?</span>
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-slate-900">Order Details</h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Select Products <span className="text-rose-500">*</span>
                  </span>
                  <select
                    required
                    disabled={loadingProducts || products.length === 0}
                    value={form.productId}
                    onChange={(e) => updateField('productId', e.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                  >
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — {formatRupee(product.price)}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Quantity <span className="text-rose-500">*</span>
                  </span>
                  <div className="mt-2 flex items-center gap-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => adjustQuantity(-1)}
                      className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-200"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => updateField('quantity', Math.max(1, Number(e.target.value) || 1))}
                      className="h-12 w-full border-x border-slate-200 bg-white text-center text-sm font-semibold outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => adjustQuantity(1)}
                      className="flex h-12 w-12 items-center justify-center text-slate-600 transition hover:bg-slate-200"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">
                    Delivery Date <span className="text-rose-500">*</span>
                  </span>
                  <div className="relative mt-2">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.date}
                      onChange={(e) => updateField('date', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700">
                    Special Instructions <span className="font-normal text-slate-400">(Optional)</span>
                  </span>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Any special requests for your order..."
                    className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.notes.length} / {NOTES_MAX}
                  </p>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || loadingProducts}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShoppingBag className="h-5 w-5" />
                {submitting ? 'Confirming Order...' : 'Confirm Order'}
              </button>
            </section>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-slate-900">Order Summary</h3>
              <p className="mt-1 text-xs text-slate-500">Choose a sweet to include in your order</p>

              {loadingProducts ? (
                <div className="mt-4 space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div
                  className="mt-4 max-h-56 space-y-2 overflow-y-auto overscroll-contain pr-0.5 sm:max-h-64"
                  role="radiogroup"
                  aria-label="Select product for order"
                >
                  {products.map((product) => {
                    const isSelected = String(form.productId) === String(product.id);
                    const thumb = getProductImageUrl(product);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => selectProduct(product.id)}
                        className={`flex w-full gap-3 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                            : 'border-slate-200 bg-slate-50 hover:border-orange-200 hover:bg-white'
                        }`}
                      >
                        <img
                          src={thumb}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900">{product.name}</p>
                          <p className="truncate text-xs text-slate-500">
                            {product.description || product.category || 'Fresh sweets'}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-orange-600">
                            {formatRupee(product.price)}
                          </p>
                        </div>
                        <span
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                            isSelected
                              ? 'border-orange-500 bg-orange-500'
                              : 'border-slate-300 bg-white'
                          }`}
                          aria-hidden
                        >
                          {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No products available.</p>
              )}

              {selectedProduct && (
                <div className="mt-4 flex gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={productImage}
                    alt={selectedProduct.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                      Selected
                    </p>
                    <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
                    <p className="text-sm font-semibold text-orange-600">{formatRupee(unitPrice)}</p>
                  </div>
                </div>
              )}

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Quantity</dt>
                  <dd className="font-medium text-slate-900">{qty}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Subtotal</dt>
                  <dd>{formatRupee(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Delivery Charges</dt>
                  <dd>{formatRupee(DELIVERY_CHARGE)}</dd>
                </div>
                <div className="flex justify-between text-slate-600">
                  <dt>Packaging Charges</dt>
                  <dd>{formatRupee(PACKAGING_CHARGE)}</dd>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-bold">
                  <dt className="text-slate-900">Total Amount</dt>
                  <dd className="text-orange-600">{formatRupee(total)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Why Shop With Us?</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                {[
                  '100% Fresh & Hygienic',
                  'On-time Delivery',
                  'Secure Payments',
                  'Best Quality Packaging',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-orange-500">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold text-slate-900">Need Help?</h3>
              <p className="mt-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Phone:</span> +91 98765 43210
              </p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-medium text-slate-800">Email:</span> support@shopsweet.com
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default OrderBookingPage;
