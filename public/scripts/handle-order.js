document.addEventListener('DOMContentLoaded', () => {
    let cart = [];
    const menuItemsContainer = document.getElementById('menu-items');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.querySelector('.cart-empty-message');
    const cartSummaryContainer = document.getElementById('cart-summary');
    const subtotalEl = document.getElementById('subtotal');
    const taxesEl = document.getElementById('taxes');
    const totalEl = document.getElementById('total');
    const placeOrderBtn = document.getElementById('place-order-btn');
    const orderStatusEl = document.getElementById('order-status');

    function addToCart(dishId, quantity) {
        const dish = dishes.find(d => d.id === dishId);
        if (!dish) return;
        const existingCartItem = cart.find(item => item.id === dishId);
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            cart.push({ ...dish, quantity });
        }
        renderCart();
    }

    function updateCartQuantity(dishId, newQuantity) {
        const cartItem = cart.find(item => item.id === dishId);
        if(cartItem) {
            if (newQuantity > 0) {
                cartItem.quantity = newQuantity;
            } else {
                cart = cart.filter(item => item.id !== dishId);
            }
            renderCart();
        }
    }
    
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartEmptyMessage.style.display = 'block';
            cartSummaryContainer.style.display = 'none';
            placeOrderBtn.disabled = true;
        } else {
            cartEmptyMessage.style.display = 'none';
            cartSummaryContainer.style.display = 'block';
            placeOrderBtn.disabled = false;
            cart.forEach(item => {
                const cartItemEl = document.createElement('div');
                cartItemEl.className = 'cart-item';
                cartItemEl.innerHTML = `
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                    <span class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</span>
                     <button class="remove-item-btn" data-id="${item.id}">×</button>
                `;
                cartItemsContainer.appendChild(cartItemEl);
            });
        }
        calculateTotals();
    }

    function calculateTotals() {
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const taxes = subtotal * 0.05;
        const total = subtotal + taxes;
        subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        taxesEl.textContent = `₹${taxes.toFixed(2)}`;
        totalEl.textContent = `₹${total.toFixed(2)}`;
    }

    async function placeOrder() {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Placing Order...';
        orderStatusEl.textContent = '';
        orderStatusEl.style.color = 'inherit';
        const orderData = {
            orderItems: cart.map(item => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            })),
            total: parseFloat(totalEl.textContent.replace('₹', '')),
            orderTime: new Date().toISOString()
        };
        console.log(JSON.stringify(orderData));
        // This is a placeholder API. In a real application, you would use your own backend API.
        try {
            const response = await fetch('/api/order', {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(orderData),
            });
          
            const result = await response.json();
          
            if (!response.ok) {
              // Just display the backend message without throwing
              orderStatusEl.textContent = result.message || 'Something went wrong!';
              orderStatusEl.style.color = 'red';
              return;
            }
          
            console.log('Order placed successfully:', result);
            orderStatusEl.textContent = 'Order placed successfully!';
            orderStatusEl.style.color = 'green';
            cart = [];
            renderCart();
          
          } catch (error) {
            console.error('Error placing order:', error);
            orderStatusEl.textContent = 'Network or server error occurred.';
            orderStatusEl.style.color = 'red';
          } finally {
            setTimeout(() => {
              placeOrderBtn.textContent = 'Place Order';
              orderStatusEl.textContent = '';
            }, 5000);
          }          
    }
    
    // Event Delegation for dynamic elements
    menuItemsContainer.addEventListener('click', e => {
        const target = e.target;
        if(target.classList.contains('add-to-cart-btn')) {
            const dishId = target.dataset.id;
            const quantityInput = target.closest('.dish-details').querySelector('.quantity-input');
            const quantity = parseInt(quantityInput.value);
            addToCart(dishId, quantity);
        } else if (target.classList.contains('quantity-btn')) {
            const action = target.dataset.action;
            const dishId = target.dataset.id;
            const quantityInput = target.closest('.quantity-control').querySelector('.quantity-input');
            let currentValue = parseInt(quantityInput.value);
            if (action === 'increase') {
                currentValue++;
            } else if (action === 'decrease' && currentValue > 1) {
                currentValue--;
            }
            quantityInput.value = currentValue;
        }
    });

    cartItemsContainer.addEventListener('click', e => {
        if(e.target.classList.contains('remove-item-btn')) {
            const dishId = e.target.dataset.id;
            updateCartQuantity(dishId, 0); // Setting quantity to 0 removes it
        }
    });

    placeOrderBtn.addEventListener('click', placeOrder);

    // Initial Render
    HandleFront.renderMenu(dishes);
    renderCart();
    const socket = io();
    socket.on('dishes-change', items => {
        console.log('Caught change!');
        HandleFront.renderMenu(items);
    });
});
