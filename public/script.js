document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('stockForm');
  const stockList = document.getElementById('stockList');
  const searchInput = document.getElementById('searchInput');

  let editingItemId = null;

  // Charger les données du stock depuis le serveur lors du chargement de la page
  loadStockFromServer();

  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    const productName = document.getElementById('productName').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);

    if (productName && quantity && !isNaN(price)) {
      const stockItem = {
        productName,
        quantity,
        price
      };

      try {
        let response;
        if (editingItemId) {
          response = await fetch(`/api/stock/${editingItemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stockItem)
          });
          editingItemId = null;
        } else {
          response = await fetch('/api/stock', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(stockItem)
          });
        }

        if (response.ok) {
          loadStockFromServer();
          form.reset();
        } else {
          alert('Erreur lors de l\'ajout ou la mise à jour du produit.');
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    } else {
      alert('Veuillez remplir tous les champs et saisir un prix valide.');
    }
  });

  stockList.addEventListener('click', async function(event) {
    const target = event.target;
    const currentItem = target.parentNode.parentNode;

    if (target.classList.contains('delete-btn')) {
      const id = currentItem.dataset.id;
      try {
        const response = await fetch(`/api/stock/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          currentItem.remove(); // Supprimez l'élément du DOM après une suppression réussie
        } else {
          const errorMsg = await response.text();
          alert('Erreur lors de la suppression du produit: ' + errorMsg);
        }
      } catch (err) {
        console.error('Erreur:', err);
      }
    } else if (target.classList.contains('edit-btn')) {
      const id = currentItem.dataset.id;
      const productName = currentItem.querySelector('td:first-child').textContent;
      const quantity = parseInt(currentItem.querySelector('.quantity').textContent);
      const price = parseFloat(currentItem.querySelectorAll('td')[2].textContent);

      document.getElementById('productName').value = productName;
      document.getElementById('quantity').value = quantity;
      document.getElementById('price').value = price;

      editingItemId = id;
    } else if (target.classList.contains('checkout-btn')) {
      const id = currentItem.dataset.id;
      const currentQuantity = parseInt(currentItem.querySelector('.quantity').textContent);
      const quantityToCheckout = prompt(`Combien de ${currentItem.querySelector('td:first-child').textContent} souhaitez-vous retirer du stock ?`, currentQuantity);
      const newQuantity = currentQuantity - parseInt(quantityToCheckout);

      if (!isNaN(quantityToCheckout) && newQuantity >= 0) {
        try {
          await fetch(`/api/stock/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantity: newQuantity })
          });

          loadStockFromServer();
        } catch (err) {
          console.error('Erreur:', err);
        }
      } else {
        alert('Veuillez saisir un nombre valide.');
      }
    }
  });

  searchInput.addEventListener('input', function() {
    const searchValue = searchInput.value.toLowerCase();
    const stockItems = stockList.querySelectorAll('tr');
    stockItems.forEach(function(item) {
      const productName = item.querySelector('td:first-child').textContent.toLowerCase();
      if (productName.includes(searchValue)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });

  async function loadStockFromServer() {
    try {
      const response = await fetch('/api/stock');
      const stockItems = await response.json();

      stockList.innerHTML = '';
      stockItems.forEach(item => {
        const montantTTC = item.quantity * item.price;
        

        const tableRow = document.createElement('tr');
        tableRow.dataset.id = item._id; // Assurez-vous que l'ID est correctement attribué
        tableRow.innerHTML = `
          <td>${item.productName}</td>
          <td class="quantity">${item.quantity}</td>
          <td>${item.price}</td>
          
          <td class="montant-ttc">${montantTTC.toFixed(2)}</td>
          <td class="actions-btns">
            <button class="edit-btn">Modifier</button>
            <button class="delete-btn">Supprimer</button>
            <button class="checkout-btn">Sortie de Stock</button>
          </td>
        `;
        stockList.appendChild(tableRow);
      });
    } catch (err) {
      console.error('Erreur:', err);
    }
  }
});
