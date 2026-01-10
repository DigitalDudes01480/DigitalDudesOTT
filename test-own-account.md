# Own Account System Test Checklist

## Test Steps:

### 1. Admin Panel - Create Product with Own Account
- [ ] Go to http://localhost:5174/admin/products
- [ ] Click "Add Product"
- [ ] Fill in product details (e.g., YouTube Premium)
- [ ] Add a profile type
- [ ] **CHECK THE "Own Account" CHECKBOX**
- [ ] Save product
- [ ] Edit the product again
- [ ] **VERIFY: Checkbox is still checked**

### 2. Product Detail Page
- [ ] Go to the product page
- [ ] Select the "Own Account" profile
- [ ] **VERIFY: Email input field appears**
- [ ] **VERIFY: "Own Account - Email Required" badge shows**
- [ ] Enter email and add to cart

### 3. Shopping Cart
- [ ] Go to cart page
- [ ] **VERIFY: "Own Account" badge shows on product card**
- [ ] **VERIFY: Email input field appears below product details**
- [ ] Enter/update email
- [ ] **VERIFY: "Email saved" message appears**

### 4. Checkout
- [ ] Proceed to checkout
- [ ] **VERIFY: If email not provided in cart, shows email input**
- [ ] Complete order

### 5. Backend Verification
- [ ] Check backend terminal for logs:
  - "Backend received profileTypes:" (should show requiresOwnAccount: true)
  - "Backend UPDATE received profileTypes:" (should show requiresOwnAccount: true)
- [ ] Check database:
  ```bash
  mongosh digital-ims --eval "db.products.findOne({}, {name: 1, 'profileTypes.requiresOwnAccount': 1}).pretty()"
  ```

## Common Issues:

1. **Checkbox not saving**: Check browser console and backend logs
2. **Email field not showing**: Check if product.profileTypes[x].requiresOwnAccount is true
3. **Email not persisting**: Check cart store updateItemEmail function
4. **Order not saving email**: Check orderController customerEmail field

## Current Status:
- Backend running: http://localhost:5001
- Frontend running: http://localhost:5174
- Debug logs enabled: YES
