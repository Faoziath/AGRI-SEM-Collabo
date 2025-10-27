import { http, HttpResponse, delay } from 'msw';
import { db } from './db';
import type { InsertUser, LoginCredentials, InsertProduct, InsertOrder, InsertThread, InsertMessage, InsertArticle, PaginatedResponse } from '@shared/schema';

const API_DELAY = 300; // Simulated network latency

// Helper to simulate pagination
function paginate<T>(items: T[], page: number = 1, pageSize: number = 20): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedItems = items.slice(start, end);

  return {
    count: items.length,
    page,
    page_size: pageSize,
    results: paginatedItems,
  };
}

export const handlers = [
  // ============================================
  // AUTH & USERS
  // ============================================
  
  // Login
  http.post('/api/v1/auth/jwt/create', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as LoginCredentials;

    const user = db.findUserByEmail(body.email);
    if (!user) {
      return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user,
    });
  }),

  // Refresh token
  http.post('/api/v1/auth/jwt/refresh', async () => {
    await delay(API_DELAY);
    return HttpResponse.json({
      access: 'mock-new-access-token',
    });
  }),

  // Register
  http.post('/api/v1/auth/users', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as InsertUser;

    const existingUser = db.findUserByEmail(body.email);
    if (existingUser) {
      return HttpResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const newUser = {
      id: db.getNextUserId(),
      ...body,
      isVerified: true,
      isSupplierVerified: body.role === 'SUPPLIER' ? false : undefined,
    };

    db.users.push(newUser);

    return HttpResponse.json({
      access: 'mock-access-token',
      refresh: 'mock-refresh-token',
      user: newUser,
    }, { status: 201 });
  }),

  // Get current user
  http.get('/api/v1/auth/users/me', async () => {
    await delay(API_DELAY);
    // For mock purposes, return first producer
    const user = db.users.find(u => u.role === 'PRODUCER');
    if (!user) {
      return HttpResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return HttpResponse.json(user);
  }),

  // ============================================
  // CULTURES & VARIETIES
  // ============================================
  
  // Get all cultures
  http.get('/api/v1/cultures', async () => {
    await delay(API_DELAY);
    return HttpResponse.json(db.cultures);
  }),

  // Get varieties for a culture
  http.get('/api/v1/cultures/:id/varieties', async ({ params }) => {
    await delay(API_DELAY);
    const cultureId = parseInt(params.id as string);
    const varieties = db.varieties.filter(v => v.cultureId === cultureId);
    return HttpResponse.json(varieties);
  }),

  // ============================================
  // PRODUCTS
  // ============================================
  
  // Get products with filtering and pagination
  http.get('/api/v1/products', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');
    const cultureId = url.searchParams.get('cultureId');
    const varietyId = url.searchParams.get('varietyId');
    const q = url.searchParams.get('q');
    const minPrice = url.searchParams.get('minPrice');
    const maxPrice = url.searchParams.get('maxPrice');
    const ordering = url.searchParams.get('ordering');

    let filtered = db.products.filter(p => p.status === 'ACTIVE');

    // Filter by variety
    if (varietyId) {
      filtered = filtered.filter(p => p.varietyId === parseInt(varietyId));
    }

    // Filter by culture (via variety)
    if (cultureId) {
      const varietiesInCulture = db.varieties
        .filter(v => v.cultureId === parseInt(cultureId))
        .map(v => v.id);
      filtered = filtered.filter(p => varietiesInCulture.includes(p.varietyId));
    }

    // Search
    if (q) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.sku.toLowerCase().includes(q.toLowerCase())
      );
    }

    // Price range
    if (minPrice) {
      filtered = filtered.filter(p => p.priceCents >= parseInt(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.priceCents <= parseInt(maxPrice));
    }

    // Sorting
    if (ordering) {
      if (ordering === 'price' || ordering === 'price-asc') {
        filtered.sort((a, b) => a.priceCents - b.priceCents);
      } else if (ordering === 'price-desc') {
        filtered.sort((a, b) => b.priceCents - a.priceCents);
      } else if (ordering === 'name') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (ordering === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    }

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  // Get single product
  http.get('/api/v1/products/:id', async ({ params }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string);
    const product = db.findProductById(productId);

    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return HttpResponse.json(product);
  }),

  // Create product
  http.post('/api/v1/products', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as InsertProduct;

    const newProduct = {
      id: db.getNextProductId(),
      supplierId: 3, // Mock supplier ID
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.products.push(newProduct);

    return HttpResponse.json(newProduct, { status: 201 });
  }),

  // Update product
  http.patch('/api/v1/products/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string);
    const body = await request.json() as Partial<InsertProduct>;

    const product = db.findProductById(productId);
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    Object.assign(product, body);

    return HttpResponse.json(product);
  }),

  // Update product status
  http.patch('/api/v1/products/:id/status', async ({ params, request }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string);
    const body = await request.json() as { status: string };

    const product = db.findProductById(productId);
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.status = body.status as any;

    return HttpResponse.json(product);
  }),

  // ============================================
  // CART
  // ============================================
  
  // Get cart
  http.get('/api/v1/cart', async () => {
    await delay(API_DELAY);
    const userId = 1; // Mock user ID
    let cart = db.findCartByUserId(userId);

    if (!cart) {
      cart = {
        id: db.getNextCartId(),
        userId,
        status: 'ACTIVE',
      };
      db.carts.push(cart);
    }

    const items = db.getCartItemsWithProducts(cart.id);

    return HttpResponse.json({
      cart,
      items,
    });
  }),

  // Add to cart
  http.post('/api/v1/cart/items', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as { productId: number; qty: number };
    const userId = 1; // Mock user ID

    let cart = db.findCartByUserId(userId);
    if (!cart) {
      cart = {
        id: db.getNextCartId(),
        userId,
        status: 'ACTIVE',
      };
      db.carts.push(cart);
    }

    // Check if item already exists
    const existingItem = db.cartItems.find(
      item => item.cartId === cart!.id && item.productId === body.productId
    );

    if (existingItem) {
      existingItem.qty += body.qty;
      const product = db.findProductById(existingItem.productId);
      return HttpResponse.json({ ...existingItem, product });
    }

    const newItem = {
      id: db.getNextCartItemId(),
      cartId: cart.id,
      productId: body.productId,
      qty: body.qty,
    };

    db.cartItems.push(newItem);

    const product = db.findProductById(newItem.productId);
    return HttpResponse.json({ ...newItem, product }, { status: 201 });
  }),

  // Update cart item
  http.put('/api/v1/cart/items/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const itemId = parseInt(params.id as string);
    const body = await request.json() as { qty: number };

    const item = db.cartItems.find(i => i.id === itemId);
    if (!item) {
      return HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    item.qty = body.qty;

    const product = db.findProductById(item.productId);
    return HttpResponse.json({ ...item, product });
  }),

  // Remove from cart
  http.delete('/api/v1/cart/items/:id', async ({ params }) => {
    await delay(API_DELAY);
    const itemId = parseInt(params.id as string);

    const index = db.cartItems.findIndex(i => i.id === itemId);
    if (index === -1) {
      return HttpResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    db.cartItems.splice(index, 1);

    return HttpResponse.json({ success: true }, { status: 204 });
  }),

  // ============================================
  // ORDERS
  // ============================================
  
  // Create order
  http.post('/api/v1/orders', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as InsertOrder;
    const userId = 1; // Mock user ID

    const cart = db.findCartByUserId(userId);
    if (!cart) {
      return HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const cartItems = db.cartItems.filter(item => item.cartId === cart.id);
    if (cartItems.length === 0) {
      return HttpResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => {
      const product = db.findProductById(item.productId);
      return sum + (product?.priceCents || 0) * item.qty;
    }, 0);

    const newOrder = {
      id: db.getNextOrderId(),
      buyerId: userId,
      supplierId: 3, // First supplier
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      totalCents: total,
      currency: 'XOF',
      ...body,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.orders.push(newOrder);

    // Create order items
    cartItems.forEach(cartItem => {
      const product = db.findProductById(cartItem.productId);
      if (product) {
        db.orderItems.push({
          id: db.getNextOrderItemId(),
          orderId: newOrder.id,
          productId: product.id,
          title: product.title,
          priceCents: product.priceCents,
          qty: cartItem.qty,
        });
      }
    });

    // Clear cart
    db.cartItems = db.cartItems.filter(item => item.cartId !== cart.id);
    cart.status = 'ORDERED';

    return HttpResponse.json(newOrder, { status: 201 });
  }),

  // Get orders
  http.get('/api/v1/orders', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');

    // For now, return all orders
    return HttpResponse.json(paginate(db.orders, page, pageSize));
  }),

  // Get single order
  http.get('/api/v1/orders/:id', async ({ params }) => {
    await delay(API_DELAY);
    const orderId = parseInt(params.id as string);
    const order = db.orders.find(o => o.id === orderId);

    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const items = db.getOrderItems(orderId);

    return HttpResponse.json({
      ...order,
      items,
    });
  }),

  // Update order status
  http.patch('/api/v1/orders/:id/status', async ({ params, request }) => {
    await delay(API_DELAY);
    const orderId = parseInt(params.id as string);
    const body = await request.json() as { status: string };

    const order = db.orders.find(o => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    order.status = body.status as any;
    order.updatedAt = new Date().toISOString();

    return HttpResponse.json(order);
  }),

  // ============================================
  // MESSAGING
  // ============================================
  
  // Create thread
  http.post('/api/v1/threads', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as InsertThread;
    const userId = 1; // Mock user ID

    const newThread = {
      id: db.getNextThreadId(),
      ...body,
      buyerId: userId,
      lastMessageAt: new Date().toISOString(),
    };

    db.threads.push(newThread);

    return HttpResponse.json(newThread, { status: 201 });
  }),

  // Get threads
  http.get('/api/v1/threads', async () => {
    await delay(API_DELAY);
    // For now, return all threads
    return HttpResponse.json(db.threads);
  }),

  // Get thread messages
  http.get('/api/v1/threads/:id/messages', async ({ params }) => {
    await delay(API_DELAY);
    const threadId = parseInt(params.id as string);
    const messages = db.getThreadMessages(threadId);

    return HttpResponse.json(messages);
  }),

  // Send message
  http.post('/api/v1/threads/:id/messages', async ({ params, request }) => {
    await delay(API_DELAY);
    const threadId = parseInt(params.id as string);
    const body = await request.json() as InsertMessage;
    const userId = 1; // Mock user ID

    const thread = db.findThreadById(threadId);
    if (!thread) {
      return HttpResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const newMessage = {
      id: db.getNextMessageId(),
      threadId,
      senderId: userId,
      ...body,
      createdAt: new Date().toISOString(),
    };

    db.messages.push(newMessage);

    // Update thread's lastMessageAt
    thread.lastMessageAt = newMessage.createdAt;

    return HttpResponse.json(newMessage, { status: 201 });
  }),

  // ============================================
  // WEATHER & ALERTS
  // ============================================
  
  // Get weather forecast
  http.get('/api/v1/advice/weather', async () => {
    await delay(API_DELAY);
    
    const forecast = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
      tempMin: 22 + Math.floor(Math.random() * 3),
      tempMax: 32 + Math.floor(Math.random() * 5),
      condition: i % 3 === 0 ? 'Ensoleillé' : i % 3 === 1 ? 'Nuageux' : 'Pluie',
      rainfallMm: i % 3 === 2 ? 5 + Math.random() * 15 : 0,
      humidity: 60 + Math.floor(Math.random() * 20),
    }));

    const cumulativeRainfall = forecast.reduce((sum, day) => sum + day.rainfallMm, 0);

    return HttpResponse.json({
      forecast,
      cumulativeRainfall,
      advice: 'Conditions favorables pour les semis cette semaine.',
    });
  }),

  // Create weather alert
  http.post('/api/v1/alerts', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json();
    const userId = 1; // Mock user ID

    const newAlert = {
      id: db.getNextAlertId(),
      userId,
      ...body,
    };

    db.weatherAlerts.push(newAlert);

    return HttpResponse.json(newAlert, { status: 201 });
  }),

  // Get alerts
  http.get('/api/v1/alerts', async () => {
    await delay(API_DELAY);
    const userId = 1; // Mock user ID
    const alerts = db.weatherAlerts.filter(a => a.userId === userId);

    return HttpResponse.json(alerts);
  }),

  // Update alert
  http.patch('/api/v1/alerts/:id', async ({ params, request }) => {
    await delay(API_DELAY);
    const alertId = parseInt(params.id as string);
    const body = await request.json();

    const alert = db.weatherAlerts.find(a => a.id === alertId);
    if (!alert) {
      return HttpResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    Object.assign(alert, body);

    return HttpResponse.json(alert);
  }),

  // ============================================
  // ARTICLES
  // ============================================
  
  // Get articles
  http.get('/api/v1/articles', async ({ request }) => {
    await delay(API_DELAY);
    const url = new URL(request.url);
    const tag = url.searchParams.get('tag');
    const q = url.searchParams.get('q');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '20');

    let filtered = db.articles.filter(a => a.status === 'PUBLISHED');

    if (tag) {
      filtered = filtered.filter(a => a.tags.includes(tag));
    }

    if (q) {
      filtered = filtered.filter(a => 
        a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.bodyMd.toLowerCase().includes(q.toLowerCase())
      );
    }

    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  // Get article by slug
  http.get('/api/v1/articles/:slug', async ({ params }) => {
    await delay(API_DELAY);
    const article = db.findArticleBySlug(params.slug as string);

    if (!article) {
      return HttpResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return HttpResponse.json(article);
  }),

  // Create article
  http.post('/api/v1/articles', async ({ request }) => {
    await delay(API_DELAY);
    const body = await request.json() as InsertArticle;
    const userId = 6; // Admin user

    const newArticle = {
      id: db.getNextArticleId(),
      ...body,
      authorId: userId,
      publishedAt: body.status === 'PUBLISHED' ? new Date().toISOString() : undefined,
    };

    db.articles.push(newArticle);

    return HttpResponse.json(newArticle, { status: 201 });
  }),

  // ============================================
  // ADMIN
  // ============================================
  
  // Get pending suppliers
  http.get('/api/v1/admin/suppliers/pending', async () => {
    await delay(API_DELAY);
    const pendingSuppliers = db.users.filter(
      u => u.role === 'SUPPLIER' && !u.isSupplierVerified
    );

    return HttpResponse.json(pendingSuppliers);
  }),

  // Verify supplier
  http.patch('/api/v1/admin/suppliers/:id/verify', async ({ params }) => {
    await delay(API_DELAY);
    const supplierId = parseInt(params.id as string);

    const supplier = db.users.find(u => u.id === supplierId);
    if (!supplier) {
      return HttpResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    supplier.isSupplierVerified = true;

    return HttpResponse.json(supplier);
  }),

  // Block product
  http.patch('/api/v1/admin/products/:id/block', async ({ params }) => {
    await delay(API_DELAY);
    const productId = parseInt(params.id as string);

    const product = db.findProductById(productId);
    if (!product) {
      return HttpResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    product.status = 'BLOCKED';

    return HttpResponse.json(product);
  }),

  // Get admin stats
  http.get('/api/v1/admin/stats', async () => {
    await delay(API_DELAY);
    
    const totalSuppliers = db.users.filter(u => u.role === 'SUPPLIER').length;
    const pendingSuppliers = db.users.filter(
      u => u.role === 'SUPPLIER' && !u.isSupplierVerified
    ).length;
    const totalProducts = db.products.length;
    const activeProducts = db.products.filter(p => p.status === 'ACTIVE').length;
    const totalOrders = db.orders.length;
    const totalRevenueCents = db.orders.reduce((sum, order) => sum + order.totalCents, 0);

    return HttpResponse.json({
      totalSuppliers,
      pendingSuppliers,
      totalProducts,
      activeProducts,
      totalOrders,
      totalRevenueCents,
    });
  }),
];
