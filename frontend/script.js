const API = 'http://linkboard-backend-in1x.onrender.com/api';

// ---------- AUTH PAGE LOGIC ----------
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginTab').classList.add('active');
  document.getElementById('signupTab').classList.remove('active');
}

function showSignup() {
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupTab').classList.add('active');
  document.getElementById('loginTab').classList.remove('active');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });
      const data = await res.json();

      if (!res.ok) {
        document.getElementById('errorMsg').textContent = data.message;
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      window.location.href = 'dashboard.html';
    } catch (err) {
      document.getElementById('errorMsg').textContent = 'Server error. Try again.';
    }
  });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;

    try {
      const res = await fetch(API + '/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      });
      const data = await res.json();

      if (!res.ok) {
        document.getElementById('errorMsg').textContent = data.message;
        return;
      }

      alert('Account created! Please login.');
      showLogin();
    } catch (err) {
      document.getElementById('errorMsg').textContent = 'Server error. Try again.';
    }
  });
}

// ---------- DASHBOARD PAGE LOGIC ----------
function getToken() {
  return localStorage.getItem('token');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  window.location.href = 'index.html';
}

async function loadCollections() {
  const res = await fetch(API + '/collections', {
    headers: { Authorization: 'Bearer ' + getToken() }
  });

  if (res.status === 401) {
    logout();
    return;
  }

  const collections = await res.json();
  const grid = document.getElementById('collectionsGrid');
  grid.innerHTML = '';

  collections.forEach(function(col) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    card.innerHTML =
      '<div class="card-actions">' +
        '<button class="edit-btn" onclick="event.stopPropagation(); editCollection(\'' + col._id + '\', \'' + col.name + '\')">✏️</button>' +
        '<button class="delete-btn" onclick="event.stopPropagation(); deleteCollection(\'' + col._id + '\')">🗑️</button>' +
      '</div>' +
      '<div class="card-icon">📁</div>' +
      '<h3>' + col.name + '</h3>' +
      '<p>' + (col.description || 'Click to explore links →') + '</p>';
    card.onclick = function() {
      window.location.href = 'collection.html?id=' + col._id + '&name=' + encodeURIComponent(col.name);
    };
    grid.appendChild(card);
  });
}

async function addCollection() {
  const name = document.getElementById('newCollectionName').value.trim();
  if (!name) return;

  await fetch(API + '/collections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({ name: name })
  });

  document.getElementById('newCollectionName').value = '';
  loadCollections();
}

async function editCollection(id, oldName) {
  const newName = prompt('Edit collection name:', oldName);
  if (!newName) return;

  await fetch(API + '/collections/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({ name: newName })
  });

  loadCollections();
}

async function deleteCollection(id) {
  if (!confirm('Delete this collection and all its links?')) return;

  await fetch(API + '/collections/' + id, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + getToken() }
  });

  loadCollections();
}

// ---------- COLLECTION (LINKS) PAGE LOGIC ----------
function getCollectionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadLinks(search) {
  search = search || '';
  const collectionId = getCollectionId();
  const res = await fetch(API + '/links/' + collectionId + '?search=' + search, {
    headers: { Authorization: 'Bearer ' + getToken() }
  });

  if (res.status === 401) {
    logout();
    return;
  }

  const links = await res.json();
  const list = document.getElementById('linksList');
  list.innerHTML = '';

  links.forEach(function(link) {
    const item = document.createElement('div');
    item.className = 'link-card';
    item.innerHTML =
      '<div class="link-info">' +
        '<h4>' + link.title + '</h4>' +
        '<p>' + (link.description || link.url) + '</p>' +
      '</div>' +
      '<div class="link-actions">' +
        '<button class="open-btn" onclick="window.open(\'' + link.url + '\', \'_blank\')">Open</button>' +
        '<button class="edit-btn" onclick="editLink(\'' + link._id + '\', \'' + link.title + '\', \'' + link.url + '\')">Edit</button>' +
        '<button class="delete-btn" onclick="deleteLink(\'' + link._id + '\')">Delete</button>' +
      '</div>';
    list.appendChild(item);
  });
}

async function addLink() {
  const title = document.getElementById('linkTitle').value.trim();
  const url = document.getElementById('linkUrl').value.trim();
  const description = document.getElementById('linkDesc').value.trim();
  const collectionId = getCollectionId();

  if (!title || !url) return;

  await fetch(API + '/links', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({ title: title, url: url, description: description, collection: collectionId })
  });

  document.getElementById('linkTitle').value = '';
  document.getElementById('linkUrl').value = '';
  document.getElementById('linkDesc').value = '';
  loadLinks();
}

async function editLink(id, oldTitle, oldUrl) {
  const newTitle = prompt('Edit title:', oldTitle);
  if (!newTitle) return;
  const newUrl = prompt('Edit URL:', oldUrl);
  if (!newUrl) return;

  await fetch(API + '/links/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken()
    },
    body: JSON.stringify({ title: newTitle, url: newUrl })
  });

  loadLinks();
}

async function deleteLink(id) {
  if (!confirm('Delete this link?')) return;

  await fetch(API + '/links/' + id, {
    method: 'DELETE',
    headers: { Authorization: 'Bearer ' + getToken() }
  });

  loadLinks();
}