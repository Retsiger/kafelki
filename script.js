const PASSWORD = 'admin123';
let currentPassword = '';
let serverAvailable = false;

const loginContainer = document.getElementById('loginContainer');
const content = document.getElementById('content');
const tilesDiv = document.getElementById('tiles');
const addForm = document.getElementById('addForm');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginOpenBtn = document.getElementById('loginOpenBtn');
const passwordInput = document.getElementById('password');
const newName = document.getElementById('newName');
const newUrl = document.getElementById('newUrl');
const newColor = document.getElementById('newColor');
const addTileBtn = document.getElementById('addTileBtn');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const addRowBtn = document.getElementById('addRowBtn');

function formatUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
        return 'https://' + url;
    }
    return url;
}

function updateUI() {
    loginContainer.classList.add('hidden');
    if (serverAvailable && isLoggedIn()) {
        logoutBtn.classList.remove('hidden');
        loginOpenBtn.classList.add('hidden');
        addForm.classList.remove('hidden');
        addCategoryBtn.classList.remove('hidden');
        addRowBtn.classList.remove('hidden');
    } else {
        logoutBtn.classList.add('hidden');
        addForm.classList.add('hidden');
        addCategoryBtn.classList.add('hidden');
        addRowBtn.classList.add('hidden');
        if (serverAvailable) {
            loginOpenBtn.classList.remove('hidden');
        } else {
            loginOpenBtn.classList.add('hidden');
        }
    }
    renderTiles();
}

let tilesCache = [];

async function loadTiles() {
    tilesCache = [];
    try {
        const res = await fetch('api/tiles');
        if (res.ok) {
            tilesCache = await res.json();
            serverAvailable = true;
        } else {
            serverAvailable = false;
        }
    } catch (e) {
        serverAvailable = false;
    }

    if (!serverAvailable) {
        try {
            const res = await fetch('tiles.json');
            if (res.ok) {
                tilesCache = await res.json();
            }
        } catch (e) {}
    }

    if (!Array.isArray(tilesCache) || !Array.isArray(tilesCache[0])) {
        tilesCache = [[
            {name: 'Przykład 1', url: 'https://example.com', color: '#ffffff'},
            {name: 'Kategorie', color: '#ffffff', children: [
                {name: 'Przykład A', url: 'https://example.org'},
                {name: 'Przykład B', url: 'https://example.net'}
            ]}
        ]];
    }
}

function getTiles() {
    return tilesCache;
}

async function saveTiles(tiles) {
    tilesCache = tiles;
    if (!serverAvailable) return Promise.resolve();
    try {
        await fetch('api/tiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-password': currentPassword
            },
            body: JSON.stringify(tiles)
        });
    } catch (e) {}
}

function renderTiles() {
    const rows = getTiles();
    tilesDiv.innerHTML = '';
    rows.forEach((row, rowIdx) => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'tiles-row';
        row.forEach((t, idx) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'tile-wrapper';
            const bg = t.color || '#ffffff';
            if (t.children && t.children.length) {
                const div = document.createElement('div');
                div.className = 'tile category';
                div.textContent = t.name;
                div.style.background = bg;
                const ul = document.createElement('ul');
                t.children.forEach(ch => {
                    const li = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = ch.url;
                    link.textContent = ch.name;
                    link.target = '_blank';
                    li.appendChild(link);
                    ul.appendChild(li);
                });
                div.appendChild(ul);
                wrapper.appendChild(div);
            } else {
                const a = document.createElement('a');
                a.href = t.url;
                a.textContent = t.name;
                a.className = 'tile';
                a.target = '_blank';
                a.style.background = bg;
                wrapper.appendChild(a);
            }
            if (isLoggedIn()) {
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edytuj';
                editBtn.onclick = () => editTile(rowIdx, idx);
                const delBtn = document.createElement('button');
                delBtn.textContent = 'Usuń';
                delBtn.onclick = () => deleteTile(rowIdx, idx);
                const upBtn = document.createElement('button');
                upBtn.textContent = '↑';
                upBtn.onclick = () => moveTileUp(rowIdx, idx);
                const downBtn = document.createElement('button');
                downBtn.textContent = '↓';
                downBtn.onclick = () => moveTileDown(rowIdx, idx);
                wrapper.appendChild(editBtn);
                wrapper.appendChild(delBtn);
                wrapper.appendChild(upBtn);
                wrapper.appendChild(downBtn);
            }
            rowDiv.appendChild(wrapper);
        });
        tilesDiv.appendChild(rowDiv);
    });
}

function isLoggedIn() {
    return sessionStorage.getItem('loggedIn') === 'true';
}

function login() {
    if (passwordInput.value === PASSWORD) {
        currentPassword = passwordInput.value;
        sessionStorage.setItem('loggedIn', 'true');
        passwordInput.value = '';
        updateUI();
    } else {
        alert('Niepoprawne hasło');
    }
}

function logout() {
    sessionStorage.removeItem('loggedIn');
    currentPassword = '';
    updateUI();
}

function editTile(rowIdx, index) {
    const rows = getTiles();
    const current = rows[rowIdx][index];
    const name = prompt('Nazwa kafelka:', current.name);
    if (!name) return;
    const color = prompt('Kolor kafelka (#RRGGBB):', current.color || '#ffffff') || current.color || '#ffffff';
    if (current.children && current.children.length) {
        const children = [];
        while (true) {
            const chName = prompt('Nazwa podlinku (anuluj aby zakończyć)');
            if (!chName) break;
            const chUrl = prompt('Adres URL');
            if (!chUrl) break;
            children.push({name: chName, url: formatUrl(chUrl)});
        }
        rows[rowIdx][index] = {name, children, color};
    } else {
        const url = prompt('Adres URL:', current.url || '');
        if (!url) return;
        rows[rowIdx][index] = {name, url: formatUrl(url), color};
    }
    saveTiles(rows).then(renderTiles);
}

function deleteTile(rowIdx, index) {
    if (!confirm('Usunąć ten kafelek?')) return;
    const rows = getTiles();
    rows[rowIdx].splice(index, 1);
    if (rows[rowIdx].length === 0) {
        rows.splice(rowIdx, 1);
    }
    saveTiles(rows).then(renderTiles);
}

function addTile() {
    if (!newName.value || !newUrl.value) return;
    const rows = getTiles();
    if (!rows.length) rows.push([]);
    rows[rows.length - 1].push({
        name: newName.value,
        url: formatUrl(newUrl.value),
        color: newColor.value || '#ffffff'
    });
    saveTiles(rows).then(renderTiles);
    newName.value = '';
    newUrl.value = '';
    newColor.value = '#ffffff';
}

function addCategory() {
    if (!newName.value) return;
    const children = [];
    while (true) {
        const chName = prompt('Nazwa podlinku (anuluj aby zakończyć)');
        if (!chName) break;
        const chUrl = prompt('Adres URL');
        if (!chUrl) break;
        children.push({name: chName, url: formatUrl(chUrl)});
    }
    if (!children.length) return;
    const rows = getTiles();
    if (!rows.length) rows.push([]);
    rows[rows.length - 1].push({
        name: newName.value,
        children,
        color: newColor.value || '#ffffff'
    });
    saveTiles(rows).then(renderTiles);
    newName.value = '';
    newColor.value = '#ffffff';
}

function addRow() {
    const rows = getTiles();
    rows.push([]);
    saveTiles(rows).then(renderTiles);
}

function moveTileUp(rowIdx, index) {
    const rows = getTiles();
    if (index > 0) {
        const row = rows[rowIdx];
        [row[index - 1], row[index]] = [row[index], row[index - 1]];
    } else if (rowIdx > 0) {
        const tile = rows[rowIdx].splice(index, 1)[0];
        rows[rowIdx - 1].push(tile);
        if (rows[rowIdx].length === 0) rows.splice(rowIdx, 1);
    }
    saveTiles(rows).then(renderTiles);
}

function moveTileDown(rowIdx, index) {
    const rows = getTiles();
    const row = rows[rowIdx];
    if (index < row.length - 1) {
        [row[index], row[index + 1]] = [row[index + 1], row[index]];
    } else {
        const tile = row.splice(index, 1)[0];
        if (rowIdx < rows.length - 1) {
            rows[rowIdx + 1].unshift(tile);
        } else {
            rows.push([tile]);
        }
        if (row.length === 0) rows.splice(rowIdx, 1);
    }
    saveTiles(rows).then(renderTiles);
}

loginBtn.onclick = login;
logoutBtn.onclick = logout;
addTileBtn.onclick = addTile;
addCategoryBtn.onclick = addCategory;
addRowBtn.onclick = addRow;
loginOpenBtn.onclick = () => {
    loginContainer.classList.remove('hidden');
    passwordInput.focus();
};

loadTiles().then(updateUI);
