const FEEDBACK_HIDE_DELAY = 6000;

class DownloadPage {
  constructor(root, data) {
    this.root = root;
    this.data = data || {};
    this.pageType = root.getAttribute('data-page-type') || 'document';
    this.isDownloadPage = this.pageType === 'download';
    this.isFormOnly = this.pageType === 'form-only';
    this.products = Array.isArray(this.data.products) ? this.data.products.slice() : [];
    this.taxonomies = this.data.taxonomies || {};
    this.sourceProductId = Number.isFinite(this.data.sourceProductId) ? this.data.sourceProductId : 0;
    this.feedbackTimer = null;
    this.currentRendered = [];

    this.productsById = new Map();
    this.products.forEach((product) => {
      const prepared = this.prepareProduct(product);
      this.productsById.set(prepared.id, prepared);
    });

    this.filterKeys = Object.keys(this.taxonomies);
    this.state = {
      search: '',
      filters: this.filterKeys.reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {}),
      sort: 'title-asc',
      selected: new Map(),
    };

    this.cacheElements();
    
    // For form-only pages, skip rendering and event binding, just populate hidden fields
    if (this.isFormOnly) {
      this.bootstrapSelection();
      this.syncHiddenInputs();
      return;
    }
    
    this.bindEvents();
    this.bootstrapSelection();
    this.renderAll();
    this.syncHiddenInputs();
    this.scrollToInitialProduct();
  }

  scrollToInitialProduct() {
    if (!this.isDownloadPage || !this.sourceProductId) {
      return;
    }

    // 少し遅延させてDOMが完全にレンダリングされてからスクロール
    setTimeout(() => {
      const targetCard = this.listEl ? this.listEl.querySelector(`[data-product-id="${this.sourceProductId}"]`) : null;
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  static normalizeSearchTerm(value) {
    if (!value) {
      return '';
    }
    return String(value).toLocaleLowerCase();
  }

  prepareProduct(product) {
    const prepared = Object.assign({}, product);
    prepared.id = Number(prepared.id);
    if (!Number.isFinite(prepared.id)) {
      return prepared;
    }
    prepared.title = prepared.title || '';
    prepared.slug = prepared.slug || '';
    prepared.permalink = prepared.permalink || '';
    prepared.pdfUrl = prepared.pdfUrl || '';
    prepared.timestamp = Number(prepared.timestamp);
    if (!Number.isFinite(prepared.timestamp)) {
      prepared.timestamp = Date.parse(prepared.date || '') || 0;
    }

    const termSets = {};
    const termNames = [];
    if (prepared.taxonomies && typeof prepared.taxonomies === 'object') {
      Object.keys(prepared.taxonomies).forEach((taxonomy) => {
        const terms = Array.isArray(prepared.taxonomies[taxonomy]) ? prepared.taxonomies[taxonomy] : [];
        const ids = [];
        terms.forEach((term) => {
          if (!term || typeof term !== 'object') {
            return;
          }
          const termId = Number(term.id);
          if (Number.isFinite(termId)) {
            ids.push(termId);
          }
          if (term.name) {
            termNames.push(term.name);
          }
        });
        termSets[taxonomy] = ids;
      });
    }
    prepared.termSets = termSets;

    const searchPieces = [prepared.title, prepared.permalink, prepared.pdfUrl, prepared.slug].concat(termNames);
    prepared.searchIndex = DownloadPage.normalizeSearchTerm(searchPieces.join(' '));

    return prepared;
  }

  cacheElements() {
    this.listEl = this.root.querySelector('[data-download-list]');
    this.selectedListEl = this.root.querySelector('[data-download-selected-list]');
    this.selectedEmptyEl = this.root.querySelector('[data-download-selected-empty]');
    this.selectedCountEl = this.root.querySelector('[data-download-selected-count]');
    this.resultCountEl = this.root.querySelector('[data-download-result-count]');
    this.feedbackEl = this.root.querySelector('[data-download-feedback]');
    this.searchInput = this.root.querySelector('[data-download-search]');
    this.sortSelect = this.root.querySelector('[data-download-sort]');
    this.resetButton = this.root.querySelector('[data-download-reset]');
    this.filterSelects = Array.from(this.root.querySelectorAll('[data-download-filter]'));
    this.form = document.querySelector('.contact .wpcf7 form');
  }

  bindEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (event) => {
        const raw = event.target.value || '';
        this.state.search = DownloadPage.normalizeSearchTerm(raw.trim());
        this.renderAll();
      });
    }

    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', (event) => {
        this.state.sort = event.target.value || 'title-asc';
        this.renderAll();
      });
    }

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        this.handleReset();
      });
    }

    if (this.filterSelects.length) {
      this.filterSelects.forEach((selectEl) => {
        selectEl.addEventListener('change', (event) => {
          const taxonomy = event.currentTarget.getAttribute('data-download-filter');
          if (!taxonomy || !(taxonomy in this.state.filters)) {
            return;
          }
          const value = event.currentTarget.value;
          const parsed = value === '' ? null : parseInt(value, 10);
          this.state.filters[taxonomy] = Number.isFinite(parsed) ? parsed : null;
          this.renderAll();
        });
      });
    }

    if (this.selectedListEl) {
      this.selectedListEl.addEventListener('click', (event) => {
        const target = event.target;
        if (!target || !target.matches('[data-remove-product]')) {
          return;
        }
        event.preventDefault();
        const id = parseInt(target.getAttribute('data-remove-product'), 10);
        if (Number.isFinite(id)) {
          this.handleSelect(id, false);
        }
      });
    }

    if (this.form) {
      this.form.addEventListener('submit', (event) => {
        if (this.state.selected.size === 0) {
          event.preventDefault();
          this.showFeedback((this.data.i18n && this.data.i18n.noneSelectedError) || '資料を1件以上選択してください。', true);
          if (this.searchInput) {
            this.searchInput.focus();
          }
        }
      });
    }
  }

  bootstrapSelection() {
    const initial = Array.isArray(this.data.initialSelection) ? this.data.initialSelection : [];
    const now = Date.now();
    initial.forEach((value, index) => {
      const id = Number(value);
      if (!Number.isFinite(id) || !this.productsById.has(id)) {
        return;
      }
      const timestamp = now + index / 1000;
      this.state.selected.set(id, timestamp);
    });

    if (!this.productsById.has(this.sourceProductId)) {
      this.sourceProductId = 0;
    }

    const selectedIds = Array.from(this.state.selected.keys());
    if (!this.sourceProductId && selectedIds.length) {
      this.sourceProductId = selectedIds[0];
    }
  }

  getFilteredProducts() {
    const search = this.state.search;
    const filters = this.state.filters;
    const filterKeys = Object.keys(filters).filter((key) => filters[key]);

    let products = this.products.map((product) => this.productsById.get(product.id)).filter(Boolean);

    if (search) {
      products = products.filter((product) => product.searchIndex.indexOf(search) !== -1);
    }

    if (filterKeys.length) {
      products = products.filter((product) => {
        for (let i = 0; i < filterKeys.length; i += 1) {
          const taxonomy = filterKeys[i];
          const requiredId = filters[taxonomy];
          if (!requiredId) {
            continue;
          }
          const termIds = product.termSets && product.termSets[taxonomy] ? product.termSets[taxonomy] : [];
          if (!termIds.length || termIds.indexOf(requiredId) === -1) {
            return false;
          }
        }
        return true;
      });
    }

    const sortKey = this.state.sort;
    const collator = new Intl.Collator('ja');

    return products.sort((a, b) => {
      if (sortKey === 'title-desc') {
        return collator.compare(b.title, a.title);
      }
      if (sortKey === 'date-desc') {
        return b.timestamp - a.timestamp;
      }
      if (sortKey === 'date-asc') {
        return a.timestamp - b.timestamp;
      }
      return collator.compare(a.title, b.title);
    });
  }

  renderAll() {
    const filtered = this.getFilteredProducts();
    this.renderList(filtered);
    this.renderSelected();
    this.updateResultCount(filtered.length);
    this.syncHiddenInputs();
  }

  renderList(products) {
    if (!this.listEl) {
      return;
    }
    this.listEl.innerHTML = '';
    this.currentRendered = [];

    if (!products.length) {
      const emptyItem = document.createElement('li');
      emptyItem.className = 'download__empty';
      const message = (this.data.i18n && this.data.i18n.noResults) || '該当する製品がありません。';
      emptyItem.textContent = message;
      this.listEl.appendChild(emptyItem);
      return;
    }

    const fragment = document.createDocumentFragment();
    const self = this;

    products.forEach((product) => {
      const item = self.buildProductItem(product);
      fragment.appendChild(item);
      self.currentRendered.push(product.id);
    });

    this.listEl.appendChild(fragment);
  }

  buildProductItem(product) {
    const li = document.createElement('li');
    li.className = 'download__item';
    li.setAttribute('data-product-id', String(product.id));

    if (this.isDownloadPage && this.state.selected.has(product.id)) {
      li.classList.add('is-selected');
    }

    const card = document.createElement('article');
    card.className = 'download__card';

    const head = document.createElement('div');
    head.className = 'download__card-head';

    if (this.isDownloadPage) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'download__checkbox';
      const checkboxId = `download-product-${product.id}`;
      checkbox.id = checkboxId;
      checkbox.value = String(product.id);
      checkbox.checked = this.state.selected.has(product.id);

      checkbox.addEventListener('change', (event) => {
        const shouldSelect = event.target.checked;
        this.handleSelect(product.id, shouldSelect);
      });

      const label = document.createElement('label');
      label.className = 'download__card-title';
      label.setAttribute('for', checkboxId);
      label.textContent = product.title;

      head.appendChild(checkbox);
      head.appendChild(label);
    } else {
      const title = document.createElement('p');
      title.className = 'download__card-title';
      title.textContent = product.title;
      head.appendChild(title);
    }

    card.appendChild(head);

    const tags = this.buildTagList(product);
    if (tags) {
      card.appendChild(tags);
    }

    const linksContainer = document.createElement('div');
    linksContainer.className = 'download__links';

    const detailLink = document.createElement('a');
    detailLink.className = 'download__link download__link--detail';
    detailLink.href = product.permalink;
    detailLink.target = '_blank';
    detailLink.rel = 'noopener noreferrer';
    detailLink.textContent = '製品ページ';
    linksContainer.appendChild(detailLink);

    if (this.isDownloadPage) {
      // catalogページ: カタログ請求ボタン（/downloadへリダイレクト）
      const requestButton = document.createElement('button');
      requestButton.type = 'button';
      requestButton.className = 'download__link download__link--request';
      requestButton.textContent = 'カタログ請求';

      requestButton.addEventListener('click', () => {
        // Check if there's already selected products to pass along
        const selectedIds = Array.from(this.state.selected.keys());
        let downloadUrl = '/download/';

        if (selectedIds.length > 0) {
          // Pass selected products to the download page
          const productSlugs = selectedIds.map(id => {
            const prod = this.productsById.get(id);
            return prod ? prod.slug : null;
          }).filter(Boolean);

          if (productSlugs.length > 0) {
            downloadUrl += '?dl_products=' + encodeURIComponent(productSlugs.join(','));
          }
        }

        window.location.href = downloadUrl;
      });

      linksContainer.appendChild(requestButton);
    } else if (product.pdfUrl) {
      const downloadLink = document.createElement('a');
      downloadLink.className = 'download__link download__link--catalog';
      downloadLink.href = product.pdfUrl;
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      downloadLink.textContent = 'カタログダウンロード';
      linksContainer.appendChild(downloadLink);
    }

    card.appendChild(linksContainer);
    li.appendChild(card);

    return li;
  }

  buildTagList(product) {
    const taxonomies = product.taxonomies;
    if (!taxonomies) {
      return null;
    }
    const items = [];
    Object.keys(taxonomies).forEach((taxonomy) => {
      const terms = Array.isArray(taxonomies[taxonomy]) ? taxonomies[taxonomy] : [];
      terms.forEach((term) => {
        if (term && term.name) {
          items.push(term.name);
        }
      });
    });

    if (!items.length) {
      return null;
    }

    const list = document.createElement('ul');
    list.className = 'download__tags';
    items.slice(0, 8).forEach((name) => {
      const li = document.createElement('li');
      li.className = 'download__tag';
      li.textContent = name;
      list.appendChild(li);
    });

    return list;
  }

  renderSelected() {
    if (!this.selectedListEl || !this.selectedEmptyEl || !this.selectedCountEl) {
      return;
    }

    const selectedEntries = Array.from(this.state.selected.entries()).sort((a, b) => a[1] - b[1]);
    const selectedIds = selectedEntries.map((entry) => entry[0]);
    const fragment = document.createDocumentFragment();

    this.selectedListEl.querySelectorAll('[data-product-id]').forEach((child) => child.remove());

    if (!selectedIds.length) {
      this.selectedEmptyEl.hidden = false;
    } else {
      this.selectedEmptyEl.hidden = true;
      selectedIds.forEach((id) => {
        const product = this.productsById.get(id);
        if (!product) {
          return;
        }
        const item = document.createElement('li');
        item.className = 'download__selected-item';
        item.setAttribute('data-product-id', String(id));

        const title = document.createElement('p');
        title.className = 'download__selected-title';
        title.textContent = product.title;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'download__selected-remove';
        button.setAttribute('data-remove-product', String(id));
        button.textContent = (this.data.i18n && this.data.i18n.remove) || '削除';

        item.appendChild(title);
        item.appendChild(button);
        fragment.appendChild(item);
      });
    }

    this.selectedListEl.appendChild(fragment);
    this.selectedCountEl.textContent = String(selectedIds.length);
    this.updateRenderedSelectionState();
  }

  updateRenderedSelectionState() {
    if (!this.listEl) {
      return;
    }
    this.currentRendered.forEach((id) => {
      const selector = `[data-product-id="${id}"]`;
      const item = this.listEl.querySelector(selector);
      if (!item) {
        return;
      }
      const checkbox = item.querySelector('.download__checkbox');
      const isSelected = this.state.selected.has(id);
      item.classList.toggle('is-selected', isSelected);
      if (checkbox) {
        checkbox.checked = isSelected;
      }
    });
  }

  handleSelect(productId, shouldSelect) {
    if (!Number.isFinite(productId) || !this.productsById.has(productId)) {
      return;
    }

    if (shouldSelect) {
      const timestamp = Date.now() + productId / 100000;
      this.state.selected.set(productId, timestamp);
    } else {
      this.state.selected.delete(productId);
    }

    this.renderSelected();
    this.updateRenderedSelectionState();
    this.syncHiddenInputs();
  }

  handleReset() {
    this.state.search = '';
    if (this.searchInput) {
      this.searchInput.value = '';
    }

    this.state.sort = 'title-asc';
    if (this.sortSelect) {
      this.sortSelect.value = 'title-asc';
    }

    this.filterKeys.forEach((key) => {
      this.state.filters[key] = null;
    });
    if (this.filterSelects.length) {
      this.filterSelects.forEach((selectEl) => {
        selectEl.value = '';
      });
    }

    this.hideFeedback();
    this.renderAll();
  }

  updateResultCount(count) {
    if (!this.resultCountEl) {
      return;
    }
    const template = this.data.i18n && this.data.i18n.resultCount ? this.data.i18n.resultCount : '%d件';
    this.resultCountEl.textContent = template.replace('%d', count);
  }

  syncHiddenInputs() {
    const ids = Array.from(this.state.selected.entries()).sort((a, b) => a[1] - b[1]).map((entry) => entry[0]);
    const selectedField = document.getElementById('download-selected-products');
    if (selectedField) {
      selectedField.value = ids.join(',');
    }

    const sourceField = document.getElementById('download-source-product');
    if (sourceField) {
      sourceField.value = this.sourceProductId && Number.isFinite(this.sourceProductId) ? String(this.sourceProductId) : '';
    }
  }

  showFeedback(message, isError) {
    if (!this.feedbackEl) {
      return;
    }
    if (this.feedbackTimer) {
      window.clearTimeout(this.feedbackTimer);
      this.feedbackTimer = null;
    }
    this.feedbackEl.textContent = message;
    this.feedbackEl.hidden = false;
    this.feedbackEl.classList.toggle('is-error', Boolean(isError));
    this.feedbackTimer = window.setTimeout(() => {
      this.hideFeedback();
    }, FEEDBACK_HIDE_DELAY);
  }

  hideFeedback() {
    if (!this.feedbackEl) {
      return;
    }
    this.feedbackEl.hidden = true;
    this.feedbackEl.classList.remove('is-error');
    this.feedbackEl.textContent = '';
  }
}

function initDownloadPage() {
  const root = document.querySelector('[data-download-page]');
  const dataScript = document.getElementById('download-page-data');
  if (!root || !dataScript) {
    return;
  }

  let data = {};
  try {
    const raw = dataScript.textContent || dataScript.innerText || '{}';
    data = JSON.parse(raw);
  } catch (error) {
    console.error('Failed to parse download page data', error);
    data = {};
  }

  new DownloadPage(root, data);
}

document.addEventListener('DOMContentLoaded', initDownloadPage);
