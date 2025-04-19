async function loadView(view) {
  const content = document.getElementById('adminContent');
  content.innerHTML = `<div class="text-info"><i class="bi bi-arrow-repeat"></i> Loading ${view}...</div>`;

  try {
    switch (view) {
      case 'top': {
        const topRes = await fetch('/admin/data/top-products');
        if (!topRes.ok) throw new Error('Failed to load top products');
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
      }

      case 'products': {
        const prodRes = await fetch('/admin/data/products');
        if (!prodRes.ok) throw new Error('Failed to load products');
        const products = await prodRes.json();

        content.innerHTML = `
          <h4>📦 Products</h4>
          <ul class="list-group mt-3">
            ${products.map(p => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between">
                <span>${p.Pname}</span>
                <div>
                  <button class="btn btn-sm btn-warning me-2" onclick="editProduct('${p._id}')">Edit</button>
                  <form action="/admin/products/delete/${p._id}" method="POST" style="display:inline;">
                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                  </form>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-success mt-3" onclick="addProduct()">➕ Add New Product</button>`;
        break;
      }

      case 'categories': {
        const catRes = await fetch('/admin/data/categories');
        if (!catRes.ok) throw new Error('Failed to load categories');
        const categories = await catRes.json();

        content.innerHTML = `
          <h4>📂 Categories</h4>
          <ul class="list-group mt-3">
            ${categories.map(c => `
              <li class="list-group-item bg-dark text-light d-flex justify-content-between">
                <span>${c.Cname}</span>
                <div>
                  <button class="btn btn-sm btn-warning me-2" onclick="editCategory('${c._id}')">Edit</button>
                  <form action="/admin/categories/delete/${c._id}" method="POST" style="display:inline;">
                    <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                  </form>
                </div>
              </li>
            `).join('')}
          </ul>
          <button class="btn btn-success mt-3" onclick="addCategory()">➕ Add New Category</button>`;
        break;
      }

      case 'users': {
        const userRes = await fetch('/user');
        if (!userRes.ok) throw new Error('Failed to load users');
        const result = await userRes.json();
        const users = result.users;

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

      default:
        content.innerHTML = `<p class="text-warning">❓ Unknown view: ${view}</p>`;
    }
  } catch (err) {
    console.error(`❌ Error loading ${view}:`, err);
    content.innerHTML = `<p class="text-danger">❌ ${err.message}</p>`;
  }
}

// ✅ Promote user to manager
async function promoteUser(userId) {
  if (!confirm('Promote this user to manager?')) return;

  try {
    const res = await fetch(`/user/promote/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();
    if (result.success) {
      alert('✅ User promoted!');
      loadView('users');
    } else {
      alert('❌ Promotion failed.');
    }
  } catch (err) {
    console.error('❌ Promote error:', err);
    alert('❌ Error promoting user.');
  }
}

// ✅ Edit product modal (FIXED)
function editProduct(id) {
  fetch(`/admin/data/products/${id}`)
    .then(res => res.json())
    .then(product => {
      document.getElementById('editProductId').value = product._id;
      document.getElementById('editPname').value = product.Pname;
      document.getElementById('editPrice').value = product.Price;
      document.getElementById('editPdesc').value = product.Pdesc || '';
      document.getElementById('editPicname').value = product.Picname || '';
      document.getElementById('editStatus').value = product.Status ?? 1;
      document.getElementById('editCid').value = product.Cid;

      // ✅ Fix here: set correct form action before submitting
      document.getElementById('editProductForm').action = '/admin/products/update';

      new bootstrap.Modal(document.getElementById('editProductModal')).show();
    })
    .catch(err => {
      console.error('❌ Failed to load product:', err);
      alert('❌ Failed to load product details.');
    });
}

// ✅ Add product
function addProduct() {
  new bootstrap.Modal(document.getElementById('addProductModal')).show();
}

// ✅ Edit category modal (FIXED)
function editCategory(id) {
  fetch(`/admin/data/categories/${id}`)
    .then(res => res.json())
    .then(category => {
      document.getElementById('editCategoryId').value = category._id;
      document.getElementById('editCname').value = category.Cname;
      document.getElementById('editCdesc').value = category.Cdesc || '';

      new bootstrap.Modal(document.getElementById('editCategoryModal')).show();
    })
    .catch(err => {
      console.error('❌ Failed to load category:', err);
      alert('❌ Failed to load category details.');
    });
}

// ✅ Add category
function addCategory() {
  new bootstrap.Modal(document.getElementById('addCategoryModal')).show();
}
