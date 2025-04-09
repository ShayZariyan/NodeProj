async function loadView(view) {
    const content = document.getElementById('adminContent');
  
    switch (view) {
      case 'top':
        const topRes = await fetch('/api/v1/admin/top-products');
        const topProducts = await topRes.json();
        content.innerHTML = `
          <h4>🏆 Top 3 Selling Products</h4>
          <ul class="list-group mt-3">
            ${topProducts.map(p => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between">
                <span>${p.product.Pname}</span>
                <span class="text-success">Sold: ${p.totalSold}</span>
              </li>
            `).join('')}
          </ul>`;
        break;
  
      case 'products':
        const prodRes = await fetch('/api/v1/products');
        const products = await prodRes.json();
        content.innerHTML = `
          <h4>📦 Products</h4>
          <ul class="list-group mt-3">
            ${products.map(p => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between">
                <span>${p.Pname}</span>
                <div>
                  <button class="btn btn-sm btn-warning me-2" onclick="editProduct('${p._id}')">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')">Delete</button>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-success mt-3" onclick="addProduct()">Add New Product</button>`;
        break;
  
      case 'categories':
        const catRes = await fetch('/api/v1/category');
        const categories = await catRes.json();
        content.innerHTML = `
          <h4>📂 Categories</h4>
          <ul class="list-group mt-3">
            ${categories.map(c => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between">
                <span>${c.Cname}</span>
                <div>
                  <button class="btn btn-sm btn-warning me-2" onclick="editCategory('${c._id}')">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteCategory('${c._id}')">Delete</button>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-success mt-3" onclick="addCategory()">Add New Category</button>`;
        break;
  
      case 'users':
        const userRes = await fetch('/api/v1/user');
        const users = await userRes.json();
        content.innerHTML = `
          <h4>👥 Registered Users</h4>
          <table class="table table-dark table-hover mt-3">
            <thead><tr><th>Name</th><th>Username</th><th>Role</th></tr></thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>${u.fullname}</td>
                  <td>${u.Uname}</td>
                  <td>
                    ${u.role || 'user'}
                    ${u.role !== 'manager' ? `<br><button class="btn btn-sm btn-outline-warning mt-1" onclick="promoteUser('${u._id}')">Promote</button>` : ''}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>`;
        break;
    }
  }
  
  // 🔘 Promote user to manager
  async function promoteUser(userId) {
    if (!confirm('Promote this user to manager?')) return;
  
    const res = await fetch(`/api/v1/user/promote/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
  
    const result = await res.json();
    if (result.success) {
      alert('User promoted to manager!');
      loadView('users');
    } else {
      alert(result.message || 'Failed to promote user.');
    }
  }  
  
  // 🧪 Placeholder functions for future modal forms
  function editProduct(id) { alert('Edit product: ' + id); }
  function deleteProduct(id) { alert('Delete product: ' + id); }
  function addProduct() { alert('Add new product'); }
  
  function editCategory(id) { alert('Edit category: ' + id); }
  function deleteCategory(id) { alert('Delete category: ' + id); }
  function addCategory() { alert('Add new category'); }
  