async function loadTaxonomy() {
  try {
    // Add cache-busting parameter to force fresh data
    const timestamp = new Date().getTime();
    const response = await fetch(`taxonomy.json?t=${timestamp}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Loaded taxonomy data:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error loading taxonomy:', error);
    
    // Try without cache-busting as fallback
    try {
      const response = await fetch('taxonomy.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Loaded taxonomy data (fallback):', data);
      return data;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return { capabilities: [], patterns: [] };
    }
  }
}

function groupByTheme(capabilities) {
  const themes = {};
  capabilities.forEach(item => {
    if (!themes[item.theme]) {
      themes[item.theme] = [];
    }
    themes[item.theme].push(item);
  });
  return themes;
}

function groupByCategory(patterns) {
  const categories = {};
  patterns.forEach(item => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });
  return categories;
}

function createCapabilityCard(cap) {
  const card = document.createElement('div');
  card.className = 'capability-card';

  const img = document.createElement('div');
  img.className = 'capability-image';
  img.innerHTML = `<span>${cap.icon || '🖼️'}</span>`;
  card.appendChild(img);

  const title = document.createElement('div');
  title.className = 'capability-title';
  title.textContent = cap.capability;
  card.appendChild(title);

  const action = document.createElement('div');
  action.className = 'capability-action';
  action.textContent = cap.action;
  card.appendChild(action);

  const definition = document.createElement('div');
  definition.className = 'capability-definition';
  definition.textContent = cap.definition;
  card.appendChild(definition);

  return card;
}

function createPatternCard(pattern) {
  const card = document.createElement('div');
  card.className = 'pattern-card';

  const header = document.createElement('div');
  header.className = 'pattern-header';

  const img = document.createElement('div');
  img.className = 'pattern-icon';
  img.innerHTML = `<span>${pattern.icon || '🔧'}</span>`;
  header.appendChild(img);

  const title = document.createElement('div');
  title.className = 'pattern-title';
  title.textContent = pattern.pattern;
  header.appendChild(title);

  card.appendChild(header);

  const category = document.createElement('div');
  category.className = 'pattern-category';
  category.textContent = pattern.category;
  card.appendChild(category);

  const description = document.createElement('div');
  description.className = 'pattern-description';
  description.textContent = pattern.description;
  card.appendChild(description);

  const useCase = document.createElement('div');
  useCase.className = 'pattern-use-case';
  useCase.innerHTML = `<strong>Use Cases:</strong> ${pattern.use_case}`;
  card.appendChild(useCase);

  return card;
}

function renderCapabilities(themes) {
  const section = document.getElementById('capabilities-section');
  section.innerHTML = '';
  
  if (Object.keys(themes).length === 0) {
    section.innerHTML = '<div class="empty-state">No capabilities data available.</div>';
    return;
  }

  console.log('Rendering capabilities themes:', Object.keys(themes)); // Debug log

  Object.keys(themes).forEach(theme => {
    const themeSection = document.createElement('div');
    themeSection.className = 'theme-section';

    const title = document.createElement('div');
    title.className = 'theme-title';
    title.textContent = theme;
    themeSection.appendChild(title);

    const list = document.createElement('div');
    list.className = 'capability-list';
    themes[theme].forEach(cap => {
      list.appendChild(createCapabilityCard(cap));
    });
    themeSection.appendChild(list);
    section.appendChild(themeSection);
  });
}

function renderPatterns(categories) {
  const section = document.getElementById('patterns-section');
  section.innerHTML = '';
  
  if (Object.keys(categories).length === 0) {
    section.innerHTML = '<div class="empty-state">No patterns data available.</div>';
    return;
  }

  console.log('Rendering patterns categories:', Object.keys(categories)); // Debug log

  Object.keys(categories).forEach(category => {
    const categorySection = document.createElement('div');
    categorySection.className = 'category-section';

    const title = document.createElement('div');
    title.className = 'category-title';
    title.textContent = category;
    categorySection.appendChild(title);

    const list = document.createElement('div');
    list.className = 'pattern-list';
    categories[category].forEach(pattern => {
      list.appendChild(createPatternCard(pattern));
    });
    categorySection.appendChild(list);
    section.appendChild(categorySection);
  });
}

function showSection(sectionId) {
  document.getElementById('capabilities-section').style.display = sectionId === 'capabilities-section' ? '' : 'none';
  document.getElementById('patterns-section').style.display = sectionId === 'patterns-section' ? '' : 'none';
}

function setActiveTab(tabId) {
  document.getElementById('tab-capabilities').classList.toggle('active', tabId === 'tab-capabilities');
  document.getElementById('tab-patterns').classList.toggle('active', tabId === 'tab-patterns');
}

function setupTabs() {
  document.getElementById('tab-capabilities').addEventListener('click', () => {
    showSection('capabilities-section');
    setActiveTab('tab-capabilities');
  });
  document.getElementById('tab-patterns').addEventListener('click', () => {
    showSection('patterns-section');
    setActiveTab('tab-patterns');
  });
}

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Page loaded, fetching taxonomy data...'); // Debug log
    const data = await loadTaxonomy();
    
    console.log('Data received:', {
      capabilitiesCount: data.capabilities ? data.capabilities.length : 0,
      patternsCount: data.patterns ? data.patterns.length : 0
    }); // Debug log
    
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    if (data.capabilities && data.capabilities.length > 0) {
      const themes = groupByTheme(data.capabilities);
      renderCapabilities(themes);
    } else {
      console.warn('No capabilities data found');
      document.getElementById('capabilities-section').innerHTML = '<div class="empty-state">No capabilities data available.</div>';
    }
    
    if (data.patterns && data.patterns.length > 0) {
      const categories = groupByCategory(data.patterns);
      renderPatterns(categories);
    } else {
      console.warn('No patterns data found');
      document.getElementById('patterns-section').innerHTML = '<div class="empty-state">No patterns data available.</div>';
    }
    
    setupTabs();
    showSection('capabilities-section');
    setActiveTab('tab-capabilities');
  } catch (error) {
    console.error('Error initializing application:', error);
    // Hide loading indicator on error
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    document.body.innerHTML = '<div class="error-state">Error loading application data. Please refresh the page.</div>';
  }
});
  