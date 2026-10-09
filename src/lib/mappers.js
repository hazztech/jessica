/** Convert between database rows (snake_case) and app objects (camelCase). */
const n = (v) => (v === null || v === undefined ? null : Number(v));

/* ---------- products ---------- */
export function productFromRow(r) {
  return {
    id: r.id, slug: r.slug, name: r.name, description: r.description, category: r.category_id,
    price: n(r.price), salePrice: n(r.sale_price), video: r.video,
    featured: r.featured, customizable: r.customizable, active: r.active, archived: r.archived,
    inventory: r.inventory, lowStockThreshold: r.low_stock_threshold,
    estimatedProductionTime: r.estimated_production_time,
    sizes: r.sizes || [], colors: r.colors || [], occasions: r.occasions || [],
    popularity: r.popularity || 0, customization: r.customization || {},
    images: (r.product_images || []).slice().sort((a, b) => a.sort - b.sort).map((i) => ({
      id: i.id, url: i.url, srcSet: i.src_set || undefined, path: i.path, alt: i.alt,
      width: i.width, height: i.height, fileName: i.file_name, fileType: i.file_type, fileSize: i.file_size,
      uploadDate: i.uploaded_at,
    })),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export function productToRow(p) {
  return {
    id: p.id, slug: p.slug, name: p.name, description: p.description || '', category_id: p.category,
    price: p.price, sale_price: p.salePrice ?? null, video: p.video || null,
    featured: !!p.featured, customizable: !!p.customizable, active: !!p.active, archived: !!p.archived,
    inventory: p.inventory ?? null, low_stock_threshold: p.lowStockThreshold ?? 3,
    estimated_production_time: p.estimatedProductionTime || '1–2 weeks',
    sizes: p.sizes || [], colors: p.colors || [], occasions: p.occasions || [],
    popularity: p.popularity || 0, customization: p.customization || {},
  };
}

export const productImageRows = (productId, images = []) =>
  images.map((i, sort) => ({
    product_id: productId, url: i.url, src_set: i.srcSet || null, path: i.path || null, alt: i.alt || '',
    width: i.width || null, height: i.height || null, file_name: i.fileName || null, file_type: i.fileType || null,
    file_size: i.fileSize || null, sort,
  }));

/* ---------- gallery ---------- */
export const galleryFromRow = (r) => ({
  id: r.id, title: r.title, category: r.category_id, description: r.description, images: r.images || [],
  featured: r.featured, published: r.published, createdAt: r.created_at, updatedAt: r.updated_at,
});
export const galleryToRow = (g) => ({
  id: g.id, title: g.title, category_id: g.category, description: g.description || '', images: g.images || [],
  featured: !!g.featured, published: !!g.published,
});

/* ---------- orders ---------- */
export function orderFromRow(r) {
  return {
    id: r.id, orderNumber: r.order_number, customer: r.customer,
    shippingAddress: r.shipping_address, billingAddress: r.billing_address, shippingMethod: r.shipping_method,
    subtotal: n(r.subtotal), discount: n(r.discount), shipping: n(r.shipping), tax: n(r.tax), total: n(r.total),
    couponCode: r.coupon_code, paymentStatus: r.payment_status, status: r.status,
    trackingNumber: r.tracking_number, notes: r.notes, preview: r.preview,
    items: (r.order_items || []).map((i) => ({
      productId: i.product_id, name: i.name, category: i.category, unitPrice: n(i.unit_price), quantity: i.quantity,
      summary: i.summary || [], uploads: i.uploads || [],
    })),
    statusHistory: (r.order_status_history || []).slice().sort((a, b) => a.at.localeCompare(b.at)).map((h) => ({ status: h.status, at: h.at })),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

/* ---------- custom requests ---------- */
export function requestToRow(rec) {
  return {
    item_types: rec.itemTypes, occasion: rec.occasion, style_theme: rec.styleTheme, colors: rec.colors,
    color_notes: rec.colorNotes, description: rec.description, personalization: rec.personalization,
    design_elements: rec.designElements, quantity: rec.quantity, additional_requests: rec.additionalRequests,
    sizes: rec.sizes, details: rec.details, detail_summary: rec.detailSummary, vision_summary: rec.visionSummary,
    common_summary: rec.commonSummary, budget: rec.budget, budget_label: rec.budgetLabel,
    requested_date: rec.requestedDate, rush_requested: rec.rushRequested,
    first_name: rec.firstName, last_name: rec.lastName, email: rec.email, phone: rec.phone,
    preferred_contact_method: rec.preferredContactMethod, acknowledged_pricing_terms: rec.acknowledgedPricingTerms,
  };
}

export function requestFromRow(r) {
  return {
    id: r.id, requestId: r.request_number, customerName: `${r.first_name} ${r.last_name}`.trim(),
    firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone,
    preferredContactMethod: r.preferred_contact_method, itemTypes: r.item_types || [],
    occasion: r.occasion, styleTheme: r.style_theme, colors: r.colors || [], colorNotes: r.color_notes,
    description: r.description, personalization: r.personalization, designElements: r.design_elements || [],
    sizes: r.sizes || [], quantity: r.quantity, additionalRequests: r.additional_requests,
    details: r.details || {}, detailSummary: r.detail_summary || [], visionSummary: r.vision_summary || [],
    commonSummary: r.common_summary || [], budget: r.budget, budgetLabel: r.budget_label,
    requestedDate: r.requested_date, rushRequested: r.rush_requested, acknowledgedPricingTerms: r.acknowledged_pricing_terms,
    adminNotes: r.admin_notes, quotedPrice: n(r.quoted_price), depositAmount: n(r.deposit_amount), status: r.status,
    uploadedImages: (r.custom_request_images || []).map((i) => ({
      id: i.id, path: i.path, url: null, thumbUrl: null, fileName: i.file_name, fileType: i.file_type,
      fileSize: i.file_size, uploadDate: i.uploaded_at,
    })),
    statusHistory: (r.custom_request_status_history || []).slice().sort((a, b) => a.at.localeCompare(b.at)).map((h) => ({ status: h.status, at: h.at })),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}
