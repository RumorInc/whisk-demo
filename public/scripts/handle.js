const optionMap = {
    inventory: false,
    sales: false,
};

class HandleFront {
    static deleteChat(chatId) {
        if (!confirm("Are you sure you want to delete this chat?")) return;
        fetch(`/api/delete-chat/${chatId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.status === 200) {
                    location.replace('/');
                } else {
                    throw new Error('Failed to delete chat');
                }
            })
            .catch(error => {
                console.error('Error deleting chat:', error);
                alert("Oops! Couldn't delete the chat. Try again later.");
            });
    }
    static async restockAll() {
        const button = document.querySelector('.restock-all');
        button.disabled = true;
        button.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        button.innerHTML = '&nbsp; Restocking... &nbsp;';
        const response = await fetch(`/api/restock`, {
            method: 'POST'
        });
        if (response.status === 200) {
            button.disabled = false;
            button.style.backgroundColor = '#2563eb';
            button.innerHTML = '<i class="material-symbols-outlined">inventory_2</i> Restock All';
        } else {
            console.error('Restock failed');
        }
    }
    static handleOptions(btnId) {
        const btn = document.getElementById(btnId);
        if (!(btnId in optionMap)) return;
        optionMap[btnId] = !optionMap[btnId];
        btn.classList.toggle('active', optionMap[btnId]);
        console.log(optionMap);
    }
    static renderInventoryCards(items) {
        const container = document.querySelector('.inventory-cards-container');
        container.innerHTML = ''; // Clear existing cards if needed
        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('inventory-card');
            if (item.stock_level === 'alarm') {
                card.classList.add('stock-alarm');
            } else if (item.stock_level === 'warn') {
                card.classList.add('stock-warn');
            }

            card.innerHTML = `
        <div class="inventory-card-content">
            <div class="inventory-card-info">
            <div class="inventory-icon">${item.emoji}</div>
            <div>
                <div class="item-title">${item.name}</div>
                <div class="item-id">${item.id}</div>
                <div class="item-quantity">Quantity: ${item.quantity} kg</div>
            </div>
            </div>
            <button class="inventory-restock-btn ${item.restock_disabled ? 'disabled' : ''}" ${item.restock_disabled ? 'disabled' : ''}>
            Restock
            </button>
        </div>
        `;
            container.appendChild(card);
        });
    }
    static renderMenu(dishes) {
        const menuItemsContainer = document.getElementById('menu-items');
        menuItemsContainer.innerHTML = '';
        dishes.forEach(dish => {
            const dishCard = document.createElement('div');
            dishCard.className = 'dish-card';
            dishCard.innerHTML = `
                <img src="${dish.icon}" alt="${dish.name}" class="dish-image">
                <div class="dish-details">
                    <h3>${dish.name}</h3>
                    <p class="dish-price">₹${dish.price.toFixed(2)}</p>
                    <div class="quantity-control">
                        <button class="quantity-btn" data-action="decrease" data-id="${dish.id}">-</button>
                        <input type="number" class="quantity-input" value="1" min="1" data-id="${dish.id}">
                        <button class="quantity-btn" data-action="increase" data-id="${dish.id}">+</button>
                    </div>
                    <button 
                        class="add-to-cart-btn ${!dish.available ? 'blocked' : ''}" 
                        data-id="${dish.id}" 
                        ${!dish.available ? 'disabled' : ''}>
                        ${dish.available ? 'Add to Cart' : 'Sold Out!'}
                    </button>
                </div>
            `;
            menuItemsContainer.appendChild(dishCard);
        });
    }
}