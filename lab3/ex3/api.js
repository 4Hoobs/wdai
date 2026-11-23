(() => {
    "use strict";

    let allProducts = [];

    async function fetchProducts() {
        const response = await fetch('https://dummyjson.com/products?limit=30');
        const data = await response.json();
        allProducts = data.products;
        renderTable();
    }

    function renderTable() {
        const searchValue = document.getElementById('search').value.toLowerCase();
        const sortValue = document.getElementById('sort').value;

        let filtered = allProducts.filter(product => 
            product.title.toLowerCase().includes(searchValue) || product.description.toLowerCase().includes(searchValue)
        );

        if (sortValue === 'asc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortValue === 'desc') {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }

        const tbody = document.getElementById('product-body');
        tbody.innerHTML = filtered.map(product => `
                    <tr>
                        <td><img src="${product.thumbnail}" alt="${product.title}"></td>
                        <td>${product.title}</td>
                        <td>${product.description}</td>
                    </tr>
                `).join('');
    }

    document.getElementById('search').addEventListener('input', renderTable);
    document.getElementById('sort').addEventListener('change', renderTable);

    fetchProducts();
})();
